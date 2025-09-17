-- CreateTable
CREATE TABLE "expense_categories" (
    "id" UUID NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "parentId" UUID,
    "level" INTEGER NOT NULL DEFAULT 1,
    "shopId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystemCategory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_account_assignments" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_account_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_categories_shopId_idx" ON "expense_categories"("shopId");

-- CreateIndex
CREATE INDEX "expense_categories_parentId_idx" ON "expense_categories"("parentId");

-- CreateIndex
CREATE INDEX "expense_categories_level_idx" ON "expense_categories"("level");

-- CreateIndex
CREATE INDEX "expense_categories_isActive_idx" ON "expense_categories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "expense_categories_shopId_code_key" ON "expense_categories"("shopId", "code");

-- CreateIndex
CREATE INDEX "category_account_assignments_shopId_idx" ON "category_account_assignments"("shopId");

-- CreateIndex
CREATE INDEX "category_account_assignments_categoryId_idx" ON "category_account_assignments"("categoryId");

-- CreateIndex
CREATE INDEX "category_account_assignments_accountId_idx" ON "category_account_assignments"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "category_account_assignments_categoryId_accountId_key" ON "category_account_assignments"("categoryId", "accountId");

-- AddForeignKey
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "expense_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_account_assignments" ADD CONSTRAINT "category_account_assignments_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_account_assignments" ADD CONSTRAINT "category_account_assignments_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_account_assignments" ADD CONSTRAINT "category_account_assignments_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;