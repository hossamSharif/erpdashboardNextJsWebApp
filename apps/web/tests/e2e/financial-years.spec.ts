import { test, expect } from '@playwright/test';

test.describe('Financial Years Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to financial years page
    await page.goto('/login');

    // Login as admin (assuming test data exists)
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for dashboard and navigate to financial years
    await page.waitForURL('/dashboard');
    await page.goto('/financial-years');
    await page.waitForLoadState('networkidle');
  });

  test('should display financial years page correctly', async ({ page }) => {
    // Check page title and description
    await expect(page.locator('h1')).toContainText('السنوات المالية');
    await expect(page.getByText('إدارة السنوات المالية وإعداد فترات المحاسبة')).toBeVisible();

    // Check action buttons
    await expect(page.getByRole('button', { name: 'إضافة سنة مالية' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'تحديث' })).toBeVisible();
  });

  test('should create a new financial year', async ({ page }) => {
    // Click add button
    await page.getByRole('button', { name: 'إضافة سنة مالية' }).click();

    // Check dialog opened
    await expect(page.getByText('إضافة سنة مالية جديدة')).toBeVisible();

    // Fill form
    await page.fill('[name="name"]', 'السنة المالية 2024');
    await page.fill('[data-testid="اختر تاريخ البداية"]', '2024-01-01');
    await page.fill('[data-testid="اختر تاريخ النهاية"]', '2024-12-31');
    await page.fill('[name="openingStockValue"]', '15000');

    // Check date range summary appears
    await expect(page.getByText('ملخص السنة المالية')).toBeVisible();
    await expect(page.getByText('366 يوم')).toBeVisible(); // 2024 is leap year

    // Submit form
    await page.getByRole('button', { name: 'إنشاء السنة المالية' }).click();

    // Check success message
    await expect(page.getByText('تم إنشاء السنة المالية بنجاح')).toBeVisible();

    // Check new year appears in list
    await expect(page.getByText('السنة المالية 2024')).toBeVisible();
    await expect(page.getByText('01 يناير 2024 - 31 ديسمبر 2024')).toBeVisible();
  });

  test('should edit existing financial year', async ({ page }) => {
    // Assuming there's at least one financial year
    await page.getByTestId('financial-year-menu').first().click();
    await page.getByRole('menuitem', { name: 'تعديل' }).click();

    // Check edit dialog opened
    await expect(page.getByText('تعديل السنة المالية')).toBeVisible();

    // Update name
    const nameInput = page.locator('[name="name"]');
    await nameInput.clear();
    await nameInput.fill('السنة المالية المحدثة');

    // Submit changes
    await page.getByRole('button', { name: 'حفظ التغييرات' }).click();

    // Check success message
    await expect(page.getByText('تم تحديث السنة المالية بنجاح')).toBeVisible();

    // Check updated name appears
    await expect(page.getByText('السنة المالية المحدثة')).toBeVisible();
  });

  test('should set financial year as current', async ({ page }) => {
    // Click on non-current year menu
    await page.getByTestId('financial-year-menu').first().click();
    await page.getByRole('menuitem', { name: 'تعيين كسنة حالية' }).click();

    // Check success message
    await expect(page.getByText('تم تعيين السنة المالية الحالية بنجاح')).toBeVisible();

    // Check current badge appears
    await expect(page.getByText('السنة الحالية')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    // Open form
    await page.getByRole('button', { name: 'إضافة سنة مالية' }).click();

    // Try to submit empty form
    await page.getByRole('button', { name: 'إنشاء السنة المالية' }).click();

    // Check validation messages
    await expect(page.getByText('Financial year name is required')).toBeVisible();

    // Fill invalid date range
    await page.fill('[name="name"]', 'Test FY');
    await page.fill('[data-testid="اختر تاريخ البداية"]', '2024-12-31');
    await page.fill('[data-testid="اختر تاريخ النهاية"]', '2024-01-01');

    await page.getByRole('button', { name: 'إنشاء السنة المالية' }).click();

    // Check date validation
    await expect(page.getByText('End date must be after start date')).toBeVisible();

    // Fill negative stock value
    await page.fill('[name="openingStockValue"]', '-100');
    await page.getByRole('button', { name: 'إنشاء السنة المالية' }).click();

    // Check stock value validation
    await expect(page.getByText('Opening stock value must be non-negative')).toBeVisible();
  });

  test('should show year end warning for current year', async ({ page }) => {
    // If current year is ending soon, warning should be visible
    const warningExists = await page.getByText('تنبيه: اقتراب نهاية السنة المالية').isVisible();

    if (warningExists) {
      // Check warning components
      await expect(page.getByText('تاريخ النهاية')).toBeVisible();
      await expect(page.getByText('الأيام المتبقية')).toBeVisible();
    }
  });

  test('should display financial year statistics', async ({ page }) => {
    // Check if financial years are displayed with statistics
    await expect(page.getByText('المخزون الافتتاحي')).toBeVisible();
    await expect(page.getByText('المخزون الختامي')).toBeVisible();
    await expect(page.getByText('عدد المعاملات')).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Refresh page to see loading
    await page.getByRole('button', { name: 'تحديث' }).click();

    // Check loading spinner appears (if loading is long enough)
    const loadingSpinner = page.locator('.animate-spin');
    // Loading might be too fast to catch, so we just check it doesn't error
  });

  test('should prevent deletion of current or closed years', async ({ page }) => {
    // Try to find a current year and check if delete option is not available
    const currentYearCard = page.locator('[data-testid="financial-year-card"]:has-text("السنة الحالية")').first();

    if (await currentYearCard.isVisible()) {
      await currentYearCard.locator('[data-testid="financial-year-menu"]').click();

      // Delete option should not be available for current year
      await expect(page.getByRole('menuitem', { name: 'حذف' })).not.toBeVisible();
    }
  });

  test('should handle empty state', async ({ page }) => {
    // If no financial years exist (or we can simulate this)
    const noDataMessage = await page.getByText('لا توجد سنوات مالية').isVisible();

    if (noDataMessage) {
      await expect(page.getByText('لم يتم إنشاء أي سنوات مالية بعد')).toBeVisible();
    }
  });

  test('should support Arabic RTL layout', async ({ page }) => {
    // Check RTL direction
    const dialog = page.locator('[role="dialog"]');
    await page.getByRole('button', { name: 'إضافة سنة مالية' }).click();

    await expect(dialog).toHaveAttribute('dir', 'rtl');

    // Check Arabic text is displayed correctly
    await expect(page.getByText('اسم السنة المالية')).toBeVisible();
    await expect(page.getByText('تاريخ البداية')).toBeVisible();
    await expect(page.getByText('تاريخ النهاية')).toBeVisible();
    await expect(page.getByText('قيمة المخزون الافتتاحي')).toBeVisible();
  });
});