import { router } from '../trpc';
import { authRouter } from './auth';
import { healthRouter } from './health';
import { shopRouter } from './shop';
import { financialYearRouter } from './financialYear';
import { profitRouter } from './profit';
import { cashBankRouter } from './cash-bank';
import { expenseCategoryRouter } from './expense-category';
import { transactionRouter } from './transaction';
import { accountsRouter } from './accounts';

export const appRouter = router({
  auth: authRouter,
  health: healthRouter,
  shop: shopRouter,
  financialYear: financialYearRouter,
  profit: profitRouter,
  cashBank: cashBankRouter,
  expenseCategory: expenseCategoryRouter,
  transaction: transactionRouter,
  accounts: accountsRouter,
});

export type AppRouter = typeof appRouter;