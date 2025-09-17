import { test, expect } from '@playwright/test';

// Test data
const testShop = {
  nameAr: 'متجر الاختبار',
  nameEn: 'Test Shop',
  code: 'TEST_SHOP'
};

const testShop2 = {
  nameAr: 'متجر الاختبار الثاني',
  nameEn: 'Second Test Shop',
  code: 'TEST_SHOP_2'
};

test.describe('Shop Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test environment - login as admin user
    await page.goto('/login');

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'admin@shop1.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // Submit login
    await page.click('[data-testid="login-button"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');

    // Navigate to shops page
    await page.goto('/dashboard/shops');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Shop Creation', () => {
    test('should create a new shop successfully', async ({ page }) => {
      // Click create shop button
      await page.click('text=Create New Shop');

      // Wait for form to load
      await page.waitForSelector('text=Create New Shop');

      // Fill Arabic name
      await page.fill('[name="nameAr"]', testShop.nameAr);

      // Fill English name
      await page.fill('[name="nameEn"]', testShop.nameEn);

      // Code should be auto-generated, but we can verify and modify
      const codeInput = page.locator('[name="code"]');
      await expect(codeInput).toHaveValue('TEST_SHOP');

      // Submit form
      await page.click('text=Create Shop');

      // Wait for success message
      await page.waitForSelector('text=Shop created successfully');

      // Verify redirect back to list
      await page.waitForSelector('text=Shop Management');

      // Verify new shop appears in list
      await expect(page.locator('text=Test Shop')).toBeVisible();
      await expect(page.locator('text=متجر الاختبار')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      // Click create shop button
      await page.click('text=Create New Shop');

      // Try to submit empty form
      await page.click('text=Create Shop');

      // Should show validation errors
      await expect(page.locator('text=Arabic name is required')).toBeVisible();
      await expect(page.locator('text=English name is required')).toBeVisible();
      await expect(page.locator('text=Shop code is required')).toBeVisible();
    });

    test('should validate duplicate shop names', async ({ page }) => {
      // First create a shop
      await page.click('text=Create New Shop');
      await page.fill('[name="nameAr"]', testShop.nameAr);
      await page.fill('[name="nameEn"]', testShop.nameEn);
      await page.click('text=Create Shop');
      await page.waitForSelector('text=Shop created successfully');

      // Try to create another shop with same names
      await page.click('text=Create New Shop');
      await page.fill('[name="nameAr"]', testShop.nameAr);
      await page.fill('[name="nameEn"]', testShop.nameEn);

      // Should show validation error
      await page.waitForSelector('text=Shop name is already taken');

      // Submit should be disabled
      const submitButton = page.locator('text=Create Shop');
      await expect(submitButton).toBeDisabled();
    });

    test('should auto-generate shop code from English name', async ({ page }) => {
      await page.click('text=Create New Shop');

      // Type English name
      await page.fill('[name="nameEn"]', 'My Amazing Store & Co.');

      // Check that code is auto-generated
      const codeInput = page.locator('[name="code"]');
      await expect(codeInput).toHaveValue('MY_AMAZING_STORE___CO_');
    });

    test('should handle special characters in shop names', async ({ page }) => {
      await page.click('text=Create New Shop');

      // Fill with special characters
      await page.fill('[name="nameAr"]', 'متجر الأدوات الكهربائية & الإلكترونية');
      await page.fill('[name="nameEn"]', 'Electrical & Electronic Tools Store');

      await page.click('text=Create Shop');

      // Should successfully create
      await page.waitForSelector('text=Shop created successfully');

      // Verify in list
      await expect(page.locator('text=Electrical & Electronic Tools Store')).toBeVisible();
    });
  });

  test.describe('Shop List Management', () => {
    test.beforeEach(async ({ page }) => {
      // Create test shops for list management tests
      await createTestShop(page, testShop);
      await createTestShop(page, testShop2);
    });

    test('should display shops in list', async ({ page }) => {
      // Navigate to shops list
      await page.goto('/dashboard/shops');

      // Should display both test shops
      await expect(page.locator('text=Test Shop')).toBeVisible();
      await expect(page.locator('text=Second Test Shop')).toBeVisible();
    });

    test('should search shops', async ({ page }) => {
      // Use search functionality
      await page.fill('[placeholder*="Search"]', 'Second');

      // Should show only matching shop
      await expect(page.locator('text=Second Test Shop')).toBeVisible();
      await expect(page.locator('text=Test Shop').first()).not.toBeVisible();

      // Clear search
      await page.fill('[placeholder*="Search"]', '');

      // Should show all shops again
      await expect(page.locator('text=Test Shop')).toBeVisible();
      await expect(page.locator('text=Second Test Shop')).toBeVisible();
    });

    test('should toggle shop status', async ({ page }) => {
      // Find the shop card and toggle status
      const shopCard = page.locator('[data-testid="shop-card"]').first();
      await shopCard.locator('text=Deactivate').click();

      // Should show inactive status
      await expect(shopCard.locator('text=Inactive')).toBeVisible();

      // Toggle back to active
      await shopCard.locator('text=Activate').click();

      // Should show active status
      await expect(shopCard.locator('text=Active')).toBeVisible();
    });

    test('should soft delete shop with confirmation', async ({ page }) => {
      // Set up confirmation dialog handler
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('deactivate this shop');
        await dialog.accept();
      });

      // Find and click delete button
      const shopCard = page.locator('[data-testid="shop-card"]').first();
      await shopCard.locator('text=Delete').click();

      // Shop should be deactivated
      await expect(shopCard.locator('text=Inactive')).toBeVisible();
    });

    test('should cancel soft delete when confirmation is denied', async ({ page }) => {
      // Set up confirmation dialog handler to cancel
      page.on('dialog', async dialog => {
        await dialog.dismiss();
      });

      // Find and click delete button
      const shopCard = page.locator('[data-testid="shop-card"]').first();
      await shopCard.locator('text=Delete').click();

      // Shop should remain active
      await expect(shopCard.locator('text=Active')).toBeVisible();
    });

    test('should handle pagination', async ({ page }) => {
      // Create many shops to test pagination
      for (let i = 3; i <= 15; i++) {
        await createTestShop(page, {
          nameAr: `متجر الاختبار ${i}`,
          nameEn: `Test Shop ${i}`,
          code: `TEST_SHOP_${i}`
        });
      }

      // Navigate to shops list
      await page.goto('/dashboard/shops');

      // Should show pagination
      await expect(page.locator('text=Next')).toBeVisible();
      await expect(page.locator('text=Previous')).toBeVisible();

      // Click next page
      await page.click('text=Next');

      // Should show page 2
      await expect(page.locator('text=Page 2')).toBeVisible();
    });
  });

  test.describe('Shop Editing', () => {
    test.beforeEach(async ({ page }) => {
      await createTestShop(page, testShop);
    });

    test('should edit shop successfully', async ({ page }) => {
      // Find shop card and click edit
      const shopCard = page.locator('[data-testid="shop-card"]').first();
      await shopCard.locator('text=Edit').click();

      // Wait for edit form
      await page.waitForSelector('text=Edit Shop');

      // Modify shop details
      await page.fill('[name="nameEn"]', 'Updated Test Shop');
      await page.fill('[name="nameAr"]', 'متجر الاختبار المحدث');

      // Submit update
      await page.click('text=Update Shop');

      // Wait for success message
      await page.waitForSelector('text=Shop updated successfully');

      // Verify changes in list
      await expect(page.locator('text=Updated Test Shop')).toBeVisible();
      await expect(page.locator('text=متجر الاختبار المحدث')).toBeVisible();
    });

    test('should cancel edit operation', async ({ page }) => {
      // Start editing
      const shopCard = page.locator('[data-testid="shop-card"]').first();
      await shopCard.locator('text=Edit').click();

      // Make changes
      await page.fill('[name="nameEn"]', 'Should Not Save');

      // Cancel
      await page.click('text=Cancel');

      // Should return to list without saving
      await page.waitForSelector('text=Shop Management');
      await expect(page.locator('text=Should Not Save')).not.toBeVisible();
      await expect(page.locator('text=Test Shop')).toBeVisible();
    });
  });

  test.describe('Arabic RTL Support', () => {
    test('should handle Arabic text input correctly', async ({ page }) => {
      await page.click('text=Create New Shop');

      // Arabic input should have RTL direction
      const arabicInput = page.locator('[name="nameAr"]');
      await expect(arabicInput).toHaveAttribute('dir', 'rtl');

      // English input should have LTR direction
      const englishInput = page.locator('[name="nameEn"]');
      await expect(englishInput).toHaveAttribute('dir', 'ltr');

      // Test Arabic text input
      await arabicInput.fill('متجر الكتب العربية والمراجع العلمية');
      await expect(arabicInput).toHaveValue('متجر الكتب العربية والمراجع العلمية');
    });

    test('should display Arabic text correctly in shop list', async ({ page }) => {
      // Create shop with Arabic name
      await createTestShop(page, {
        nameAr: 'متجر الأجهزة الذكية والتقنية الحديثة',
        nameEn: 'Smart Devices & Modern Technology Store',
        code: 'SMART_TECH'
      });

      // Navigate to list
      await page.goto('/dashboard/shops');

      // Verify Arabic text is displayed correctly
      await expect(page.locator('text=متجر الأجهزة الذكية والتقنية الحديثة')).toBeVisible();
    });
  });

  test.describe('User Assignment', () => {
    test('should handle user assignment during shop creation', async ({ page }) => {
      await page.click('text=Create New Shop');

      // Fill basic info
      await page.fill('[name="nameAr"]', testShop.nameAr);
      await page.fill('[name="nameEn"]', testShop.nameEn);

      // Select users (if any available)
      const userSelect = page.locator('[name="assignedUserIds"]');
      if (await userSelect.isVisible()) {
        // Select multiple users using Ctrl+Click
        await userSelect.selectOption({ index: 0 });
      }

      await page.click('text=Create Shop');
      await page.waitForSelector('text=Shop created successfully');

      // Verify shop was created
      await expect(page.locator('text=Test Shop')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network error by blocking API calls
      await page.route('**/api/trpc/shop.create', route => {
        route.abort();
      });

      await page.click('text=Create New Shop');
      await page.fill('[name="nameAr"]', testShop.nameAr);
      await page.fill('[name="nameEn"]', testShop.nameEn);
      await page.click('text=Create Shop');

      // Should show error message
      await expect(page.locator('text=Failed to create shop')).toBeVisible();
    });

    test('should handle loading states', async ({ page }) => {
      // Delay API response to see loading state
      await page.route('**/api/trpc/shop.list', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        route.continue();
      });

      await page.goto('/dashboard/shops');

      // Should show loading spinner
      await expect(page.locator('.animate-spin')).toBeVisible();
    });
  });
});

// Helper function to create a test shop
async function createTestShop(page: any, shop: { nameAr: string; nameEn: string; code: string }) {
  await page.click('text=Create New Shop');
  await page.fill('[name="nameAr"]', shop.nameAr);
  await page.fill('[name="nameEn"]', shop.nameEn);
  // Code should auto-generate, but we can set it explicitly if needed
  const codeInput = page.locator('[name="code"]');
  await codeInput.clear();
  await codeInput.fill(shop.code);
  await page.click('text=Create Shop');
  await page.waitForSelector('text=Shop created successfully', { timeout: 10000 });

  // Navigate back to list
  await page.goto('/dashboard/shops');
  await page.waitForLoadState('networkidle');
}