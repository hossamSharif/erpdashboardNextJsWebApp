import { PrismaClient } from '@prisma/client';
import type {
  CreateFinancialYearInput,
  UpdateFinancialYearInput,
  CloseFinancialYearInput,
  UpdateOpeningStockValueInput,
  UpdateClosingStockValueInput,
  BulkUpdateStockValuesInput,
  FinancialYear,
  FinancialYearWithCounts
} from '@multi-shop/shared';
import { TRPCError } from '@trpc/server';
import { ProfitCalculationService } from './profit-calculation.service';

export class FinancialYearService {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateFinancialYearInput): Promise<FinancialYear> {
    // Check for overlapping financial years
    const overlapping = await this.prisma.financialYear.findFirst({
      where: {
        shopId: input.shopId,
        OR: [
          {
            startDate: {
              lte: input.endDate
            },
            endDate: {
              gte: input.startDate
            }
          }
        ]
      }
    });

    if (overlapping) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Financial year dates overlap with existing financial year'
      });
    }

    // Check if there's already a current financial year
    const currentYear = await this.prisma.financialYear.findFirst({
      where: {
        shopId: input.shopId,
        isCurrent: true
      }
    });

    // Create the financial year
    const financialYear = await this.prisma.financialYear.create({
      data: {
        ...input,
        isCurrent: !currentYear // Set as current if no current year exists
      },
      include: {
        shop: true,
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    return financialYear;
  }

  async list(shopId: string): Promise<FinancialYearWithCounts[]> {
    const financialYears = await this.prisma.financialYear.findMany({
      where: {
        shopId
      },
      include: {
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: [
        { isCurrent: 'desc' },
        { startDate: 'desc' }
      ]
    });

    return financialYears;
  }

  async getById(id: string): Promise<FinancialYear> {
    const financialYear = await this.prisma.financialYear.findUnique({
      where: { id },
      include: {
        shop: true,
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    if (!financialYear) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Financial year not found'
      });
    }

    return financialYear;
  }

  async update(input: UpdateFinancialYearInput): Promise<FinancialYear> {
    const existingYear = await this.getById(input.id);

    if (existingYear.isClosed) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot update a closed financial year'
      });
    }

    // If updating dates, check for overlaps
    if (input.startDate || input.endDate) {
      const startDate = input.startDate || existingYear.startDate;
      const endDate = input.endDate || existingYear.endDate;

      const overlapping = await this.prisma.financialYear.findFirst({
        where: {
          shopId: existingYear.shopId,
          id: { not: input.id },
          OR: [
            {
              startDate: {
                lte: endDate
              },
              endDate: {
                gte: startDate
              }
            }
          ]
        }
      });

      if (overlapping) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Updated dates would overlap with existing financial year'
        });
      }
    }

    const { id, ...updateData } = input;
    const updatedYear = await this.prisma.financialYear.update({
      where: { id },
      data: updateData,
      include: {
        shop: true,
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    return updatedYear;
  }

  async setCurrent(id: string): Promise<FinancialYear> {
    const financialYear = await this.getById(id);

    if (financialYear.isClosed) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot set a closed financial year as current'
      });
    }

    // Use transaction to ensure only one current year per shop
    await this.prisma.$transaction(async (tx) => {
      // Remove current flag from all years in the shop
      await tx.financialYear.updateMany({
        where: {
          shopId: financialYear.shopId,
          isCurrent: true
        },
        data: {
          isCurrent: false
        }
      });

      // Set the specified year as current
      await tx.financialYear.update({
        where: { id },
        data: {
          isCurrent: true
        }
      });
    });

    return this.getById(id);
  }

  async close(input: CloseFinancialYearInput): Promise<FinancialYear> {
    const financialYear = await this.getById(input.id);

    if (financialYear.isClosed) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Financial year is already closed'
      });
    }

    // Check if this is the current year - don't allow closing if it's current
    if (financialYear.isCurrent) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot close the current financial year. Please set another year as current first.'
      });
    }

    // Validate the closing using profit calculation service
    const profitService = new ProfitCalculationService(this.prisma);
    const validation = await profitService.validateYearClosure(
      input.id,
      financialYear.shopId,
      input.closingStockValue
    );

    // If there are warnings, include them in the response but don't block closure
    if (validation.warnings.length > 0) {
      console.warn(`Financial year closure warnings for ${input.id}:`, validation.warnings);
    }

    // Close the financial year with audit logging
    const closedYear = await this.prisma.$transaction(async (tx) => {
      // Log the closing stock value change
      await tx.stockValueHistory.create({
        data: {
          financialYearId: input.id,
          fieldChanged: 'closingStockValue',
          oldValue: financialYear.closingStockValue,
          newValue: input.closingStockValue,
          changedAt: new Date()
        }
      });

      // Close the financial year
      return tx.financialYear.update({
        where: { id: input.id },
        data: {
          isClosed: true,
          closingStockValue: input.closingStockValue
        },
        include: {
          shop: true,
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });
    });

    return closedYear;
  }

  async getCurrentForShop(shopId: string): Promise<FinancialYear | null> {
    const currentYear = await this.prisma.financialYear.findFirst({
      where: {
        shopId,
        isCurrent: true
      },
      include: {
        shop: true,
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    return currentYear;
  }

  async validateTransactionYear(financialYearId: string): Promise<boolean> {
    const financialYear = await this.prisma.financialYear.findUnique({
      where: { id: financialYearId },
      select: { isClosed: true }
    });

    if (!financialYear) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Financial year not found'
      });
    }

    if (financialYear.isClosed) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot create transactions in a closed financial year'
      });
    }

    return true;
  }

  async delete(id: string): Promise<void> {
    const financialYear = await this.getById(id);

    if (financialYear.isClosed) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot delete a closed financial year'
      });
    }

    if (financialYear.isCurrent) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot delete the current financial year'
      });
    }

    if (financialYear._count.transactions > 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot delete a financial year with existing transactions'
      });
    }

    await this.prisma.financialYear.delete({
      where: { id }
    });
  }

  async updateOpeningStockValue(input: UpdateOpeningStockValueInput): Promise<FinancialYear> {
    // Verify the financial year exists and belongs to the shop
    const financialYear = await this.prisma.financialYear.findFirst({
      where: {
        id: input.financialYearId,
        shopId: input.shopId
      }
    });

    if (!financialYear) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Financial year not found for the specified shop'
      });
    }

    if (financialYear.isClosed) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot update opening stock value for a closed financial year'
      });
    }

    // Update the opening stock value with audit logging
    const updatedYear = await this.prisma.$transaction(async (tx) => {
      // Log the change for audit purposes
      await tx.stockValueHistory.create({
        data: {
          financialYearId: input.financialYearId,
          fieldChanged: 'openingStockValue',
          oldValue: financialYear.openingStockValue,
          newValue: input.openingStockValue,
          changedAt: new Date()
        }
      });

      // Update the financial year
      return tx.financialYear.update({
        where: { id: input.financialYearId },
        data: {
          openingStockValue: input.openingStockValue
        },
        include: {
          shop: true,
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });
    });

    return updatedYear;
  }

  async updateClosingStockValue(input: UpdateClosingStockValueInput): Promise<FinancialYear> {
    // Verify the financial year exists and belongs to the shop
    const financialYear = await this.prisma.financialYear.findFirst({
      where: {
        id: input.financialYearId,
        shopId: input.shopId
      }
    });

    if (!financialYear) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Financial year not found for the specified shop'
      });
    }

    if (financialYear.isClosed) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot update closing stock value for a closed financial year'
      });
    }

    // Update the closing stock value with audit logging
    const updatedYear = await this.prisma.$transaction(async (tx) => {
      // Log the change for audit purposes
      await tx.stockValueHistory.create({
        data: {
          financialYearId: input.financialYearId,
          fieldChanged: 'closingStockValue',
          oldValue: financialYear.closingStockValue,
          newValue: input.closingStockValue,
          changedAt: new Date()
        }
      });

      // Update the financial year
      return tx.financialYear.update({
        where: { id: input.financialYearId },
        data: {
          closingStockValue: input.closingStockValue
        },
        include: {
          shop: true,
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });
    });

    return updatedYear;
  }

  async bulkUpdateStockValues(updates: BulkUpdateStockValuesInput[]): Promise<FinancialYear[]> {
    const results: FinancialYear[] = [];

    for (const update of updates) {
      // Verify the financial year exists and belongs to the shop
      const financialYear = await this.prisma.financialYear.findFirst({
        where: {
          id: update.financialYearId,
          shopId: update.shopId
        }
      });

      if (!financialYear) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Financial year ${update.financialYearId} not found for shop ${update.shopId}`
        });
      }

      if (financialYear.isClosed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Cannot update stock values for closed financial year ${update.financialYearId}`
        });
      }
    }

    // Process all updates in a transaction
    await this.prisma.$transaction(async (tx) => {
      for (const update of updates) {
        const financialYear = await tx.financialYear.findUnique({
          where: { id: update.financialYearId }
        });

        if (!financialYear) continue;

        const updateData: any = {};

        // Log opening stock value change if provided
        if (update.openingStockValue !== undefined) {
          await tx.stockValueHistory.create({
            data: {
              financialYearId: update.financialYearId,
              fieldChanged: 'openingStockValue',
              oldValue: financialYear.openingStockValue,
              newValue: update.openingStockValue,
              changedAt: new Date()
            }
          });
          updateData.openingStockValue = update.openingStockValue;
        }

        // Log closing stock value change if provided
        if (update.closingStockValue !== undefined) {
          await tx.stockValueHistory.create({
            data: {
              financialYearId: update.financialYearId,
              fieldChanged: 'closingStockValue',
              oldValue: financialYear.closingStockValue,
              newValue: update.closingStockValue,
              changedAt: new Date()
            }
          });
          updateData.closingStockValue = update.closingStockValue;
        }

        // Update the financial year if there are changes
        if (Object.keys(updateData).length > 0) {
          const updatedYear = await tx.financialYear.update({
            where: { id: update.financialYearId },
            data: updateData,
            include: {
              shop: true,
              _count: {
                select: {
                  transactions: true
                }
              }
            }
          });
          results.push(updatedYear);
        }
      }
    });

    return results;
  }
}