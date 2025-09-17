import { test, expect } from '@playwright/test';

test.describe('Stock Value Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Mock successful authentication
    await page.route('**/api/auth/**', async (route) => {
      const url = route.request().url();
      if (url.includes('session')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-admin-123',
              email: 'admin@stockvalue.test',
              name: 'Test Admin',
              nameAr: 'مدير الاختبار',
              nameEn: 'Test Admin',
              role: 'ADMIN',
              shopId: 'test-shop-123',
              isActive: true
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
        });
      } else {
        await route.continue();
      }
    });

    // Mock tRPC API calls
    await page.route('**/api/trpc/**', async (route) => {
      const url = route.request().url();
      const postData = route.request().postDataJSON();

      if (url.includes('financialYear.list')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: [
                {
                  id: 'fy-2024',
                  name: '2024',
                  startDate: '2024-01-01T00:00:00.000Z',
                  endDate: '2024-12-31T00:00:00.000Z',
                  openingStockValue: 10000,
                  closingStockValue: null,
                  isCurrent: true,
                  isClosed: false,
                  shopId: 'test-shop-123',
                  _count: { transactions: 5 },
                  shop: {
                    nameAr: 'متجر الاختبار',
                    nameEn: 'Test Shop'
                  }
                },
                {
                  id: 'fy-2023',
                  name: '2023',
                  startDate: '2023-01-01T00:00:00.000Z',
                  endDate: '2023-12-31T00:00:00.000Z',
                  openingStockValue: 8000,
                  closingStockValue: 10000,
                  isCurrent: false,
                  isClosed: true,
                  shopId: 'test-shop-123',
                  _count: { transactions: 12 },
                  shop: {
                    nameAr: 'متجر الاختبار',
                    nameEn: 'Test Shop'
                  }
                }
              ]
            }
          })
        });
      } else if (url.includes('shop.list')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: [
                {
                  id: 'test-shop-123',
                  nameAr: 'متجر الاختبار',
                  nameEn: 'Test Shop',
                  code: 'TESTSHOP',
                  isActive: true
                }
              ]
            }
          })
        });
      } else if (url.includes('updateOpeningStockValue')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                id: 'fy-2024',
                name: '2024',
                openingStockValue: postData.openingStockValue,
                closingStockValue: null,
                isCurrent: true,
                isClosed: false,
                shopId: 'test-shop-123',
                _count: { transactions: 5 }
              }
            }
          })
        });
      } else if (url.includes('updateClosingStockValue')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: {
                id: 'fy-2024',
                name: '2024',
                openingStockValue: 10000,
                closingStockValue: postData.closingStockValue,
                isCurrent: true,
                isClosed: false,
                shopId: 'test-shop-123',
                _count: { transactions: 5 }
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to financial years page
    await page.goto('/financial-years');
    await page.waitForLoadState('networkidle');
  });

  test('should display stock value management interface', async ({ page }) => {
    // Check if financial years are displayed
    await expect(page.locator('text=2024')).toBeVisible();
    await expect(page.locator('text=2023')).toBeVisible();

    // Click on the dropdown menu for 2024 financial year
    await page.locator('[data-testid="fy-2024-menu"]').first().click();

    // Check if "إدارة قيم المخزون" (Manage Stock Values) option is visible
    await expect(page.locator('text=إدارة قيم المخزون')).toBeVisible();
  });

  test('should open and interact with stock value management form', async ({ page }) => {
    // Open stock value management for 2024
    await page.locator('[data-testid="fy-2024-menu"]').first().click();
    await page.locator('text=إدارة قيم المخزون').click();

    // Check if stock value management form is displayed
    await expect(page.locator('text=إدارة قيم المخزون')).toBeVisible();
    await expect(page.locator('text=قيمة المخزون الافتتاحي')).toBeVisible();
    await expect(page.locator('text=قيمة المخزون الختامي')).toBeVisible();

    // Check if current values are displayed
    await expect(page.locator('text=10,000.00 ر.س')).toBeVisible();

    // Click edit button
    await page.locator('text=تعديل').click();

    // Check if input fields are now editable
    await expect(page.locator('input[type="number"]').first()).toBeEnabled();
  });

  test('should update opening stock value', async ({ page }) => {
    // Open stock value management form
    await page.locator('[data-testid="fy-2024-menu"]').first().click();
    await page.locator('text=إدارة قيم المخزون').click();

    // Click edit button
    await page.locator('text=تعديل').click();

    // Update opening stock value
    const openingStockInput = page.locator('input[type="number"]').first();
    await openingStockInput.clear();
    await openingStockInput.fill('15000');

    // Click save button
    await page.locator('text=حفظ التغييرات').click();

    // Check for success message
    await expect(page.locator('text=تم تحديث قيمة المخزون الافتتاحي بنجاح')).toBeVisible();
  });

  test('should update closing stock value', async ({ page }) => {
    // Open stock value management form
    await page.locator('[data-testid="fy-2024-menu"]').first().click();
    await page.locator('text=إدارة قيم المخزون').click();

    // Click edit button
    await page.locator('text=تعديل').click();

    // Update closing stock value
    const closingStockInput = page.locator('input[type="number"]').nth(1);
    await closingStockInput.fill('18000');

    // Click save button
    await page.locator('text=حفظ التغييرات').click();

    // Check for success message
    await expect(page.locator('text=تم تحديث قيمة المخزون الختامي بنجاح')).toBeVisible();
  });

  test('should validate negative stock values', async ({ page }) => {
    // Open stock value management form
    await page.locator('[data-testid="fy-2024-menu"]').first().click();
    await page.locator('text=إدارة قيم المخزون').click();

    // Click edit button
    await page.locator('text=تعديل').click();

    // Try to enter negative value
    const openingStockInput = page.locator('input[type="number"]').first();
    await openingStockInput.clear();
    await openingStockInput.fill('-1000');

    // Check for validation error
    await expect(page.locator('text=Opening stock value must be non-negative')).toBeVisible();
  });

  test('should open bulk update dialog', async ({ page }) => {
    // Click bulk update button
    await page.locator('text=تحديث قيم المخزون بالجملة').click();

    // Check if bulk update dialog is displayed
    await expect(page.locator('text=تحديث قيم المخزون بالجملة')).toBeVisible();
    await expect(page.locator('text=تحديث قيم المخزون الافتتاحي والختامي لعدة سنوات مالية في نفس الوقت')).toBeVisible();

    // Check if financial years are listed
    await expect(page.locator('text=2024')).toBeVisible();
    // 2023 should not be listed because it's closed
    await expect(page.locator('text=2023')).not.toBeVisible();
  });

  test('should handle bulk stock value updates', async ({ page }) => {
    // Mock bulk update API response
    await page.route('**/api/trpc/**', async (route) => {
      const url = route.request().url();
      if (url.includes('bulkUpdateStockValues')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            result: {
              data: [
                {
                  id: 'fy-2024',
                  name: '2024',
                  openingStockValue: 12000,
                  closingStockValue: 15000,
                  isCurrent: true,
                  isClosed: false,
                  shopId: 'test-shop-123'
                }
              ]
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // Open bulk update dialog
    await page.locator('text=تحديث قيم المخزون بالجملة').click();

    // Update values for the financial year
    const openingInput = page.locator('input[placeholder="لا تغيير"]').first();
    await openingInput.fill('12000');

    const closingInput = page.locator('input[placeholder="لا تغيير"]').nth(1);
    await closingInput.fill('15000');

    // Click save button
    await page.locator('text=حفظ التغييرات').click();

    // Check for success message
    await expect(page.locator('text=تم تحديث قيم المخزون بنجاح')).toBeVisible();
  });

  test('should export stock values template', async ({ page }) => {
    // Open bulk update dialog
    await page.locator('text=تحديث قيم المخزون بالجملة').click();

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click export template button
    await page.locator('text=تصدير قالب').click();

    // Wait for download to complete
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('stock_values_template.csv');
  });

  test('should show stock value history dialog', async ({ page }) => {
    // Open stock value management form
    await page.locator('[data-testid="fy-2024-menu"]').first().click();
    await page.locator('text=إدارة قيم المخزون').click();

    // Click history button
    await page.locator('text=السجل').click();

    // Check if history dialog is displayed
    await expect(page.locator('text=سجل تغييرات قيم المخزون')).toBeVisible();
    await expect(page.locator('text=جميع التغييرات المسجلة لقيم المخزون للسنة المالية 2024')).toBeVisible();

    // For now, expect empty state message
    await expect(page.locator('text=لا توجد سجلات متاحة')).toBeVisible();
  });

  test('should disable editing for closed financial years', async ({ page }) => {
    // Try to access stock value management for closed year (2023)
    // Since 2023 is closed, the menu option should not be available or should be disabled

    await page.locator('[data-testid="fy-2023-menu"]').first().click();

    // Check that "إدارة قيم المخزون" is not available for closed years
    await expect(page.locator('text=إدارة قيم المخزون')).not.toBeVisible();
  });

  test('should handle form cancellation', async ({ page }) => {
    // Open stock value management form
    await page.locator('[data-testid="fy-2024-menu"]').first().click();
    await page.locator('text=إدارة قيم المخزون').click();

    // Click edit button
    await page.locator('text=تعديل').click();

    // Make some changes
    const openingStockInput = page.locator('input[type="number"]').first();
    await openingStockInput.clear();
    await openingStockInput.fill('99999');

    // Click cancel button
    await page.locator('text=إلغاء').click();

    // Check that form is no longer in edit mode
    await expect(page.locator('input[type="number"]')).not.toBeVisible();

    // Check that original value is restored
    await expect(page.locator('text=10,000.00 ر.س')).toBeVisible();
  });

  test('should handle mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to financial years page
    await page.goto('/financial-years');
    await page.waitForLoadState('networkidle');

    // Check if mobile layout is applied
    await expect(page.locator('[data-testid="fy-2024-menu"]')).toBeVisible();

    // Open stock value management
    await page.locator('[data-testid="fy-2024-menu"]').first().click();
    await page.locator('text=إدارة قيم المخزون').click();

    // Check if mobile-responsive form is displayed correctly
    await expect(page.locator('text=قيمة المخزون الافتتاحي')).toBeVisible();
    await expect(page.locator('text=قيمة المخزون الختامي')).toBeVisible();

    // Open bulk update on mobile
    await page.goBack();
    await page.locator('text=تحديث قيم المخزون بالجملة').click();

    // Check if bulk update dialog is responsive
    await expect(page.locator('text=تحديث قيم المخزون بالجملة')).toBeVisible();
  });
});