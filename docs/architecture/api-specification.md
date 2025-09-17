# API Specification

Based on the tRPC selection from our Tech Stack, here are the complete router definitions for type-safe API communication.

## tRPC Router Definitions

```typescript
// Root router combining all feature routers
export const appRouter = router({
  auth: authRouter,
  shops: shopsRouter,
  accounts: accountsRouter,
  transactions: transactionsRouter,
  sync: syncRouter,
  notifications: notificationsRouter,
  reports: reportsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

// Authentication router
export const authRouter = router({
  // Get current user session
  getSession: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.session;
    }),

  // Sign in with credentials
  signIn: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      shopId: z.string().optional(), // For shop workers
    }))
    .mutation(async ({ input, ctx }) => {
      // Authentication logic
      return { user, session };
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(z.object({
      nameAr: z.string().min(1),
      nameEn: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      // Update user profile
      return updatedUser;
    }),

  // Change password
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      // Password change logic
      return { success: true };
    }),
});

// Shops management router
export const shopsRouter = router({
  // Get user's shop (for workers) or all shops (for admin)
  getMyShops: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role === 'ADMIN') {
        return await ctx.db.shop.findMany({
          where: { ownerId: ctx.user.id },
          include: { users: true, _count: { select: { transactions: true } } }
        });
      }
      return await ctx.db.shop.findUnique({
        where: { id: ctx.user.shopId },
        include: { accounts: true }
      });
    }),

  // Create new shop (admin only)
  create: adminProcedure
    .input(z.object({
      nameAr: z.string().min(1),
      nameEn: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create shop with default accounts
      return createdShop;
    }),

  // Update shop details
  update: adminProcedure
    .input(z.object({
      id: z.string(),
      nameAr: z.string().min(1),
      nameEn: z.string().min(1),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      return updatedShop;
    }),

  // Get shop dashboard data
  getDashboard: protectedProcedure
    .input(z.object({
      shopId: z.string(),
      date: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Return dashboard metrics
      return {
        cashBalance: number,
        bankBalance: number,
        todayStats: { sales, purchases, expenses },
        pendingSyncCount: number,
        lastSyncAt: Date,
      };
    }),
});

// Transactions router
export const transactionsRouter = router({
  // Get daily transactions
  getDaily: protectedProcedure
    .input(z.object({
      shopId: z.string(),
      date: z.date(),
    }))
    .query(async ({ input, ctx }) => {
      return dailyTransactions;
    }),

  // Create new transaction
  create: protectedProcedure
    .input(z.object({
      type: z.enum(['SALES', 'PURCHASE', 'EXPENSE', 'TRANSFER']),
      amount: z.number().positive(),
      amountPaid: z.number().nonnegative(),
      change: z.number().nonnegative(),
      description: z.string().min(1),
      accountId: z.string(),
      counterAccountId: z.string().optional(),
      transactionDate: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create transaction with balance updates
      return createdTransaction;
    }),

  // Sync router for offline operations
  syncNow: protectedProcedure
    .input(z.object({
      shopId: z.string(),
      localTransactions: z.array(LocalTransactionSchema),
    }))
    .mutation(async ({ input, ctx }) => {
      // Process sync with conflict resolution
      return {
        syncId: string,
        status: 'SUCCESS' | 'PARTIAL' | 'FAILURE',
        processedCount: number,
        conflictsResolved: number,
        errors: string[],
      };
    }),

  // Reports router
  generateDaily: protectedProcedure
    .input(z.object({
      shopId: z.string(),
      date: z.date(),
      format: z.enum(['PDF', 'EXCEL']),
      language: z.enum(['AR', 'EN']).default('AR'),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        reportUrl: string,
        filename: string,
        expiresAt: Date,
      };
    }),
});
```

---
