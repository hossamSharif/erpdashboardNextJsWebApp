import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { FinancialYearService } from '../../../src/server/services/financialYear.service';
import type { PrismaClient } from '@prisma/client';
import type { CreateFinancialYearInput, UpdateFinancialYearInput } from '@multi-shop/shared';

// Mock Prisma client
const mockPrisma = {
  financialYear: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
} as unknown as PrismaClient;

describe('FinancialYearService', () => {
  let service: FinancialYearService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FinancialYearService(mockPrisma);
  });

  describe('create', () => {
    const createInput: CreateFinancialYearInput = {
      name: 'FY 2024',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      openingStockValue: 10000,
      shopId: 'shop-1',
    };

    it('should create a financial year successfully', async () => {
      const mockCreatedYear = {
        id: 'fy-1',
        ...createInput,
        isCurrent: true,
        isClosed: false,
        closingStockValue: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        shop: { id: 'shop-1', nameAr: 'متجر', nameEn: 'Shop' },
        _count: { transactions: 0 },
      };

      mockPrisma.financialYear.findFirst.mockResolvedValueOnce(null); // No overlapping years
      mockPrisma.financialYear.findFirst.mockResolvedValueOnce(null); // No current year
      mockPrisma.financialYear.create.mockResolvedValueOnce(mockCreatedYear);

      const result = await service.create(createInput);

      expect(result).toEqual(mockCreatedYear);
      expect(mockPrisma.financialYear.create).toHaveBeenCalledWith({
        data: {
          ...createInput,
          isCurrent: true,
        },
        include: {
          shop: true,
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      });
    });

    it('should throw error for overlapping financial years', async () => {
      const overlappingYear = {
        id: 'existing-fy',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31'),
      };

      mockPrisma.financialYear.findFirst.mockResolvedValueOnce(overlappingYear);

      await expect(service.create(createInput)).rejects.toThrow(TRPCError);
    });

    it('should set isCurrent to false if current year exists', async () => {
      const existingCurrentYear = { id: 'current-fy', isCurrent: true };

      mockPrisma.financialYear.findFirst.mockResolvedValueOnce(null); // No overlapping
      mockPrisma.financialYear.findFirst.mockResolvedValueOnce(existingCurrentYear); // Has current year
      mockPrisma.financialYear.create.mockResolvedValueOnce({
        id: 'new-fy',
        ...createInput,
        isCurrent: false,
      });

      await service.create(createInput);

      expect(mockPrisma.financialYear.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isCurrent: false,
          }),
        })
      );
    });
  });

  describe('setCurrent', () => {
    it('should set a financial year as current', async () => {
      const mockYear = {
        id: 'fy-1',
        isClosed: false,
        shopId: 'shop-1',
      };

      mockPrisma.financialYear.findUnique.mockResolvedValueOnce(mockYear);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });
      mockPrisma.financialYear.updateMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.financialYear.update.mockResolvedValueOnce(mockYear);
      mockPrisma.financialYear.findUnique.mockResolvedValueOnce({
        ...mockYear,
        isCurrent: true,
      });

      const result = await service.setCurrent('fy-1');

      expect(mockPrisma.financialYear.updateMany).toHaveBeenCalledWith({
        where: {
          shopId: 'shop-1',
          isCurrent: true,
        },
        data: {
          isCurrent: false,
        },
      });
      expect(mockPrisma.financialYear.update).toHaveBeenCalledWith({
        where: { id: 'fy-1' },
        data: {
          isCurrent: true,
        },
      });
    });

    it('should throw error for closed financial year', async () => {
      const mockClosedYear = {
        id: 'fy-1',
        isClosed: true,
      };

      mockPrisma.financialYear.findUnique.mockResolvedValueOnce(mockClosedYear);

      await expect(service.setCurrent('fy-1')).rejects.toThrow(TRPCError);
    });
  });

  describe('close', () => {
    it('should close a financial year successfully', async () => {
      const mockYear = {
        id: 'fy-1',
        isClosed: false,
        isCurrent: false,
      };

      const closeInput = {
        id: 'fy-1',
        closingStockValue: 15000,
      };

      mockPrisma.financialYear.findUnique.mockResolvedValueOnce(mockYear);
      mockPrisma.financialYear.update.mockResolvedValueOnce({
        ...mockYear,
        isClosed: true,
        closingStockValue: 15000,
      });

      const result = await service.close(closeInput);

      expect(mockPrisma.financialYear.update).toHaveBeenCalledWith({
        where: { id: 'fy-1' },
        data: {
          isClosed: true,
          closingStockValue: 15000,
        },
        include: {
          shop: true,
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      });
    });

    it('should throw error for already closed year', async () => {
      const mockClosedYear = {
        id: 'fy-1',
        isClosed: true,
      };

      mockPrisma.financialYear.findUnique.mockResolvedValueOnce(mockClosedYear);

      await expect(service.close({ id: 'fy-1', closingStockValue: 15000 }))
        .rejects.toThrow(TRPCError);
    });

    it('should throw error for current year', async () => {
      const mockCurrentYear = {
        id: 'fy-1',
        isClosed: false,
        isCurrent: true,
      };

      mockPrisma.financialYear.findUnique.mockResolvedValueOnce(mockCurrentYear);

      await expect(service.close({ id: 'fy-1', closingStockValue: 15000 }))
        .rejects.toThrow(TRPCError);
    });
  });

  describe('delete', () => {
    it('should delete a financial year successfully', async () => {
      const mockYear = {
        id: 'fy-1',
        isClosed: false,
        isCurrent: false,
        _count: { transactions: 0 },
      };

      mockPrisma.financialYear.findUnique.mockResolvedValueOnce(mockYear);
      mockPrisma.financialYear.delete.mockResolvedValueOnce(mockYear);

      await service.delete('fy-1');

      expect(mockPrisma.financialYear.delete).toHaveBeenCalledWith({
        where: { id: 'fy-1' },
      });
    });

    it('should throw error for closed year', async () => {
      const mockClosedYear = {
        id: 'fy-1',
        isClosed: true,
      };

      mockPrisma.financialYear.findUnique.mockResolvedValueOnce(mockClosedYear);

      await expect(service.delete('fy-1')).rejects.toThrow(TRPCError);
    });

    it('should throw error for current year', async () => {
      const mockCurrentYear = {
        id: 'fy-1',
        isCurrent: true,
      };

      mockPrisma.financialYear.findUnique.mockResolvedValueOnce(mockCurrentYear);

      await expect(service.delete('fy-1')).rejects.toThrow(TRPCError);
    });

    it('should throw error for year with transactions', async () => {
      const mockYearWithTransactions = {
        id: 'fy-1',
        isClosed: false,
        isCurrent: false,
        _count: { transactions: 5 },
      };

      mockPrisma.financialYear.findUnique.mockResolvedValueOnce(mockYearWithTransactions);

      await expect(service.delete('fy-1')).rejects.toThrow(TRPCError);
    });
  });

  describe('validateTransactionYear', () => {
    it('should return true for open financial year', async () => {
      mockPrisma.financialYear.findUnique.mockResolvedValueOnce({
        isClosed: false,
      });

      const result = await service.validateTransactionYear('fy-1');

      expect(result).toBe(true);
    });

    it('should throw error for closed financial year', async () => {
      mockPrisma.financialYear.findUnique.mockResolvedValueOnce({
        isClosed: true,
      });

      await expect(service.validateTransactionYear('fy-1')).rejects.toThrow(TRPCError);
    });

    it('should throw error for non-existent financial year', async () => {
      mockPrisma.financialYear.findUnique.mockResolvedValueOnce(null);

      await expect(service.validateTransactionYear('fy-1')).rejects.toThrow(TRPCError);
    });
  });
});