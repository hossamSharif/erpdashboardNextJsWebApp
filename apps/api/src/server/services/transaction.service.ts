import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';

const prisma = new PrismaClient();

export class TransactionService {
  static async getDailyTransactions(shopId: string, date: Date) {
    // Set date range for the selected day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        shopId,
        transactionDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        debitAccount: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            code: true
          }
        },
        creditAccount: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            code: true
          }
        },
        debitUser: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true
          }
        },
        creditUser: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return transactions;
  }

  static async deleteTransaction(transactionId: string, shopId: string) {
    // First check if the transaction exists and belongs to the shop
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        shopId
      }
    });

    if (!transaction) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found or access denied'
      });
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id: transactionId }
    });

    return { success: true };
  }
}