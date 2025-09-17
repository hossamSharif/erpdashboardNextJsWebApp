import { z } from 'zod';

export const createFinancialYearSchema = z.object({
  name: z.string().min(1, 'Financial year name is required').max(100, 'Name must be less than 100 characters'),
  startDate: z.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Start date must be a valid date'
  }),
  endDate: z.date({
    required_error: 'End date is required',
    invalid_type_error: 'End date must be a valid date'
  }),
  openingStockValue: z.number().nonnegative('Opening stock value must be non-negative'),
  shopId: z.string().uuid('Invalid shop ID')
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

export const updateFinancialYearSchema = z.object({
  id: z.string().uuid('Invalid financial year ID'),
  name: z.string().min(1, 'Financial year name is required').max(100, 'Name must be less than 100 characters').optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  openingStockValue: z.number().nonnegative('Opening stock value must be non-negative').optional()
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

export const closeFinancialYearSchema = z.object({
  id: z.string().uuid('Invalid financial year ID'),
  closingStockValue: z.number().nonnegative('Closing stock value must be non-negative')
});

export const setCurrentFinancialYearSchema = z.object({
  id: z.string().uuid('Invalid financial year ID')
});

export const listFinancialYearsSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID')
});

export const financialYearIdSchema = z.object({
  id: z.string().uuid('Invalid financial year ID')
});

export const updateOpeningStockValueSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID'),
  financialYearId: z.string().uuid('Invalid financial year ID'),
  openingStockValue: z.number().nonnegative('Opening stock value must be non-negative')
});

export const updateClosingStockValueSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID'),
  financialYearId: z.string().uuid('Invalid financial year ID'),
  closingStockValue: z.number().nonnegative('Closing stock value must be non-negative')
});

export const bulkUpdateStockValuesSchema = z.object({
  updates: z.array(z.object({
    shopId: z.string().uuid('Invalid shop ID'),
    financialYearId: z.string().uuid('Invalid financial year ID'),
    openingStockValue: z.number().nonnegative('Opening stock value must be non-negative').optional(),
    closingStockValue: z.number().nonnegative('Closing stock value must be non-negative').optional()
  })).min(1, 'At least one update is required')
});

export type CreateFinancialYearInput = z.infer<typeof createFinancialYearSchema>;
export type UpdateFinancialYearInput = z.infer<typeof updateFinancialYearSchema>;
export type CloseFinancialYearInput = z.infer<typeof closeFinancialYearSchema>;
export type SetCurrentFinancialYearInput = z.infer<typeof setCurrentFinancialYearSchema>;
export type ListFinancialYearsInput = z.infer<typeof listFinancialYearsSchema>;
export type FinancialYearIdInput = z.infer<typeof financialYearIdSchema>;
export type UpdateOpeningStockValueInput = z.infer<typeof updateOpeningStockValueSchema>;
export type UpdateClosingStockValueInput = z.infer<typeof updateClosingStockValueSchema>;
export type BulkUpdateStockValuesInput = z.infer<typeof bulkUpdateStockValuesSchema>;