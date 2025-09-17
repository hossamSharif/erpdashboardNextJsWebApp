import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample shop with bilingual names
  const shop = await prisma.shop.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      nameAr: 'متجر قطع الغيار النموذجي',
      nameEn: 'Model Spare Parts Shop',
      ownerId: '550e8400-e29b-41d4-a716-446655440002',
      isActive: true,
    },
  });

  console.log('✅ Created sample shop:', shop.nameEn);

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'admin@example.com',
      name: 'System Administrator',
      hashedPassword,
      role: 'ADMIN',
      shopId: shop.id,
      isActive: true,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create regular user
  const regularUser = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440004',
      email: 'user@example.com',
      name: 'Regular User',
      hashedPassword: await bcrypt.hash('user123', 12),
      role: 'USER',
      shopId: shop.id,
      isActive: true,
    },
  });

  console.log('✅ Created regular user:', regularUser.email);

  // Create Financial Year
  const financialYear = await prisma.financialYear.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440005',
      year: new Date().getFullYear(),
      startDate: new Date(`${new Date().getFullYear()}-01-01T00:00:00Z`),
      endDate: new Date(`${new Date().getFullYear()}-12-31T23:59:59Z`),
      isCurrent: true,
      isClosed: false,
      openingStock: 50000.00,
      closingStock: 0.00,
      shopId: shop.id,
    },
  });

  console.log('✅ Created financial year:', financialYear.year);

  // Create Standard Chart of Accounts
  const accounts = [
    // Assets
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      code: '1000',
      nameAr: 'الأصول المتداولة',
      nameEn: 'Current Assets',
      accountType: 'ASSET',
      level: 0,
      parentId: null,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      code: '1100',
      nameAr: 'النقدية والبنك',
      nameEn: 'Cash and Bank',
      accountType: 'ASSET',
      level: 1,
      parentId: '550e8400-e29b-41d4-a716-446655440010',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440012',
      code: '1200',
      nameAr: 'المخزون',
      nameEn: 'Inventory',
      accountType: 'ASSET',
      level: 1,
      parentId: '550e8400-e29b-41d4-a716-446655440010',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440013',
      code: '1300',
      nameAr: 'العملاء',
      nameEn: 'Accounts Receivable',
      accountType: 'ASSET',
      level: 1,
      parentId: '550e8400-e29b-41d4-a716-446655440010',
    },

    // Liabilities
    {
      id: '550e8400-e29b-41d4-a716-446655440020',
      code: '2000',
      nameAr: 'الخصوم المتداولة',
      nameEn: 'Current Liabilities',
      accountType: 'LIABILITY',
      level: 0,
      parentId: null,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440021',
      code: '2100',
      nameAr: 'الموردين',
      nameEn: 'Accounts Payable',
      accountType: 'LIABILITY',
      level: 1,
      parentId: '550e8400-e29b-41d4-a716-446655440020',
    },

    // Equity
    {
      id: '550e8400-e29b-41d4-a716-446655440030',
      code: '3000',
      nameAr: 'حقوق الملكية',
      nameEn: 'Equity',
      accountType: 'EQUITY',
      level: 0,
      parentId: null,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440031',
      code: '3100',
      nameAr: 'رأس المال',
      nameEn: 'Capital',
      accountType: 'EQUITY',
      level: 1,
      parentId: '550e8400-e29b-41d4-a716-446655440030',
    },

    // Revenue
    {
      id: '550e8400-e29b-41d4-a716-446655440040',
      code: '4000',
      nameAr: 'الإيرادات',
      nameEn: 'Revenue',
      accountType: 'REVENUE',
      level: 0,
      parentId: null,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440041',
      code: '4100',
      nameAr: 'مبيعات قطع الغيار',
      nameEn: 'Spare Parts Sales',
      accountType: 'REVENUE',
      level: 1,
      parentId: '550e8400-e29b-41d4-a716-446655440040',
    },

    // Expenses
    {
      id: '550e8400-e29b-41d4-a716-446655440050',
      code: '5000',
      nameAr: 'المصروفات',
      nameEn: 'Expenses',
      accountType: 'EXPENSE',
      level: 0,
      parentId: null,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440051',
      code: '5100',
      nameAr: 'تكلفة البضاعة المباعة',
      nameEn: 'Cost of Goods Sold',
      accountType: 'EXPENSE',
      level: 1,
      parentId: '550e8400-e29b-41d4-a716-446655440050',
    },
  ];

  for (const accountData of accounts) {
    const account = await prisma.account.create({
      data: {
        ...accountData,
        shopId: shop.id,
        balance: 0.00,
      },
    });
    console.log(`✅ Created account: ${account.code} - ${account.nameEn}`);
  }

  // Create sample transactions
  const sampleTransactions = [
    // Opening Balance - Capital Investment
    {
      id: '550e8400-e29b-41d4-a716-446655440060',
      transactionType: 'OPENING_BALANCE',
      amount: 100000.00,
      description: 'Initial capital investment',
      transactionDate: new Date(`${new Date().getFullYear()}-01-01T09:00:00Z`),
      debitAccountId: '550e8400-e29b-41d4-a716-446655440011', // Cash and Bank
      creditAccountId: '550e8400-e29b-41d4-a716-446655440031', // Capital
      debitUserId: adminUser.id,
      creditUserId: adminUser.id,
      shopId: shop.id,
      financialYearId: financialYear.id,
      isSynced: true,
    },
    // Purchase Transaction
    {
      id: '550e8400-e29b-41d4-a716-446655440061',
      transactionType: 'PURCHASE',
      amount: 5000.00,
      amountPaid: 5000.00,
      change: 0.00,
      description: 'Purchase of spare parts inventory',
      transactionDate: new Date(`${new Date().getFullYear()}-01-15T10:30:00Z`),
      debitAccountId: '550e8400-e29b-41d4-a716-446655440012', // Inventory
      creditAccountId: '550e8400-e29b-41d4-a716-446655440011', // Cash and Bank
      debitUserId: regularUser.id,
      creditUserId: regularUser.id,
      shopId: shop.id,
      financialYearId: financialYear.id,
      isSynced: true,
    },
    // Sale Transaction
    {
      id: '550e8400-e29b-41d4-a716-446655440062',
      transactionType: 'SALE',
      amount: 1500.00,
      amountPaid: 1500.00,
      change: 0.00,
      description: 'Sale of brake pads to customer',
      notes: 'Customer: Ahmed Al-Mahmoud',
      transactionDate: new Date(`${new Date().getFullYear()}-01-20T14:15:00Z`),
      debitAccountId: '550e8400-e29b-41d4-a716-446655440011', // Cash and Bank
      creditAccountId: '550e8400-e29b-41d4-a716-446655440041', // Spare Parts Sales
      debitUserId: regularUser.id,
      creditUserId: regularUser.id,
      shopId: shop.id,
      financialYearId: financialYear.id,
      isSynced: true,
    },
  ];

  for (const transactionData of sampleTransactions) {
    const transaction = await prisma.transaction.create({
      data: transactionData,
    });
    console.log(`✅ Created transaction: ${transaction.transactionType} - $${transaction.amount}`);
  }

  // Create sample notifications
  const notifications = [
    {
      titleAr: 'مرحباً بك في النظام',
      titleEn: 'Welcome to the System',
      messageAr: 'تم إنشاء حسابك بنجاح. يمكنك الآن البدء في استخدام النظام.',
      messageEn: 'Your account has been created successfully. You can now start using the system.',
      notificationType: 'SYSTEM_UPDATE',
      priority: 2,
      userId: adminUser.id,
      shopId: shop.id,
    },
    {
      titleAr: 'تمت إضافة معاملة جديدة',
      titleEn: 'New Transaction Added',
      messageAr: 'تم إضافة معاملة بيع بقيمة 1500 ريال بنجاح.',
      messageEn: 'Sale transaction of $1500 has been added successfully.',
      notificationType: 'TRANSACTION_CREATED',
      priority: 1,
      userId: regularUser.id,
      shopId: shop.id,
      relatedEntityId: '550e8400-e29b-41d4-a716-446655440062',
    },
  ];

  for (const notificationData of notifications) {
    const notification = await prisma.notification.create({
      data: notificationData,
    });
    console.log(`✅ Created notification: ${notification.titleEn}`);
  }

  // Create sample sync log
  const syncLog = await prisma.syncLog.create({
    data: {
      syncType: 'MANUAL',
      syncStatus: 'COMPLETED',
      recordsProcessed: 3,
      conflictsResolved: 0,
      errorCount: 0,
      duration: 2500,
      metadata: JSON.stringify({
        initialSetup: true,
        seedDataCreated: new Date().toISOString(),
        tablesSeeded: ['shops', 'users', 'accounts', 'transactions', 'notifications'],
      }),
      shopId: shop.id,
      startedAt: new Date(Date.now() - 2500),
      completedAt: new Date(),
    },
  });

  console.log('✅ Created sync log:', syncLog.syncType);

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\nCreated entities:');
  console.log(`- 1 Shop: "${shop.nameEn}"`);
  console.log(`- 2 Users: ${adminUser.email}, ${regularUser.email}`);
  console.log(`- 1 Financial Year: ${financialYear.year}`);
  console.log(`- ${accounts.length} Accounts (Chart of Accounts)`);
  console.log(`- ${sampleTransactions.length} Sample Transactions`);
  console.log(`- ${notifications.length} Sample Notifications`);
  console.log(`- 1 Sync Log entry`);
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('User: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });