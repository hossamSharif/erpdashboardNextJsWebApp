import { z } from 'zod';
import { TransactionType, PaymentMethod } from '../types/transaction';

export const createTransactionSchema = z.object({
  transactionType: z.nativeEnum(TransactionType),
  amount: z.number().positive('Amount must be positive'),
  amountPaid: z.number().min(0, 'Amount paid cannot be negative').optional(),
  change: z.number().min(0, 'Change cannot be negative').optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  accountId: z.string().uuid('Invalid account ID'),
  counterAccountId: z.string().uuid('Invalid counter account ID'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionDate: z.date().optional()
}).refine(
  (data) => {
    // If amountPaid is provided, it should not exceed total amount
    if (data.amountPaid !== undefined) {
      return data.amountPaid <= data.amount;
    }
    return true;
  },
  {
    message: 'Amount paid cannot exceed total amount',
    path: ['amountPaid']
  }
);

export const salesTransactionFormSchema = z.object({
  totalAmount: z.number().positive('Total amount must be positive'),
  customerId: z.string().min(1, 'Customer is required'),
  amountPaid: z.number().min(0, 'Amount paid cannot be negative'),
  change: z.number().min(0, 'Change cannot be negative'),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: 'Payment method is required' })
  }),
  invoiceComment: z.string().optional()
}).refine(
  (data) => data.amountPaid <= data.totalAmount,
  {
    message: 'Amount paid cannot exceed total amount',
    path: ['amountPaid']
  }
);

export const transactionQuerySchema = z.object({
  shopId: z.string().uuid(),
  date: z.date()
});

export const deleteTransactionSchema = z.object({
  id: z.string().uuid(),
  shopId: z.string().uuid()
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type SalesTransactionFormInput = z.infer<typeof salesTransactionFormSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
export type DeleteTransactionInput = z.infer<typeof deleteTransactionSchema>;