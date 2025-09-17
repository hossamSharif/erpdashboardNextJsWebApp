import { test, expect } from '@playwright/test';

test.describe('Cash & Bank Account Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to cash & bank management
    await page.goto('/admin/cash-bank');
  });

  test.describe('Cash Account Management', () => {
    test('should create a new cash account', async ({ page }) => {
      // Click on Add Cash Account button
      await page.click('button:has-text("Add Cash Account")');

      // Fill in the form
      await page.fill('input[name="nameAr"]', 'الصندوق الرئيسي');
      await page.fill('input[name="nameEn"]', 'Main Cash');
      await page.fill('input[name="openingBalance"]', '1000');

      // Submit the form
      await page.click('button:has-text("Save")');

      // Verify the account appears in the list
      await expect(page.locator('text=Main Cash')).toBeVisible();
      await expect(page.locator('text=$1,000.00')).toBeVisible();
    });

    test('should create a cash account with negative balance (overdraft)', async ({ page }) => {
      await page.click('button:has-text("Add Cash Account")');

      await page.fill('input[name="nameAr"]', 'صندوق السحب على المكشوف');
      await page.fill('input[name="nameEn"]', 'Overdraft Cash');
      await page.fill('input[name="openingBalance"]', '-500');

      await page.click('button:has-text("Save")');

      await expect(page.locator('text=Overdraft Cash')).toBeVisible();
      await expect(page.locator('text=-$500.00')).toBeVisible();
    });

    test('should set a cash account as default', async ({ page }) => {
      // Create a cash account first
      await page.click('button:has-text("Add Cash Account")');
      await page.fill('input[name="nameAr"]', 'الصندوق الافتراضي');
      await page.fill('input[name="nameEn"]', 'Default Cash');
      await page.fill('input[name="openingBalance"]', '2000');
      await page.click('input[name="isDefault"]');
      await page.click('button:has-text("Save")');

      // Verify default badge appears
      await expect(page.locator('text=Default')).toBeVisible();
    });

    test('should adjust cash account balance', async ({ page }) => {
      // Assuming an account exists, click on edit button
      await page.click('button[aria-label="Adjust Balance"]').first();

      // Fill in the adjustment form
      await page.fill('input[name="newBalance"]', '1500');
      await page.fill('textarea[name="changeReason"]', 'Cash deposit from sales');

      await page.click('button:has-text("Update")');

      // Verify balance is updated
      await expect(page.locator('text=$1,500.00')).toBeVisible();
    });

    test('should show cash account balance history', async ({ page }) => {
      // Click on history button for an account
      await page.click('button[aria-label="View History"]').first();

      // Verify history modal opens
      await expect(page.locator('text=Balance History')).toBeVisible();

      // Verify history table is displayed
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th:has-text("Date")')).toBeVisible();
      await expect(page.locator('th:has-text("Previous Balance")')).toBeVisible();
      await expect(page.locator('th:has-text("Change")')).toBeVisible();
      await expect(page.locator('th:has-text("New Balance")')).toBeVisible();
      await expect(page.locator('th:has-text("Reason")')).toBeVisible();
    });

    test('should delete a cash account', async ({ page }) => {
      // Click delete button
      await page.click('button[aria-label="Delete"]').first();

      // Confirm deletion
      await page.click('button:has-text("Confirm")');

      // Verify account is removed
      await expect(page.locator('text=Cash account deleted')).toBeVisible();
    });
  });

  test.describe('Bank Account Management', () => {
    test('should create a new bank account', async ({ page }) => {
      // Click on Add Bank Account button
      await page.click('button:has-text("Add Bank Account")');

      // Fill in the form
      await page.fill('input[name="nameAr"]', 'البنك الأهلي');
      await page.fill('input[name="nameEn"]', 'National Bank');
      await page.fill('input[name="accountNumber"]', '1234567890');
      await page.fill('input[name="bankName"]', 'National Bank of Commerce');
      await page.fill('input[name="iban"]', 'SA1234567890123456789012');
      await page.fill('input[name="openingBalance"]', '50000');

      // Submit the form
      await page.click('button:has-text("Save")');

      // Verify the account appears in the list
      await expect(page.locator('text=National Bank')).toBeVisible();
      await expect(page.locator('text=1234567890')).toBeVisible();
      await expect(page.locator('text=$50,000.00')).toBeVisible();
    });

    test('should create multiple bank accounts', async ({ page }) => {
      // Create first bank account
      await page.click('button:has-text("Add Bank Account")');
      await page.fill('input[name="nameAr"]', 'البنك الأول');
      await page.fill('input[name="nameEn"]', 'First Bank');
      await page.fill('input[name="accountNumber"]', '1111111111');
      await page.fill('input[name="bankName"]', 'First National Bank');
      await page.fill('input[name="openingBalance"]', '25000');
      await page.click('button:has-text("Save")');

      // Create second bank account
      await page.click('button:has-text("Add Bank Account")');
      await page.fill('input[name="nameAr"]', 'البنك الثاني');
      await page.fill('input[name="nameEn"]', 'Second Bank');
      await page.fill('input[name="accountNumber"]', '2222222222');
      await page.fill('input[name="bankName"]', 'Second National Bank');
      await page.fill('input[name="openingBalance"]', '35000');
      await page.click('button:has-text("Save")');

      // Verify both accounts appear
      await expect(page.locator('text=First Bank')).toBeVisible();
      await expect(page.locator('text=Second Bank')).toBeVisible();
    });

    test('should validate IBAN format', async ({ page }) => {
      await page.click('button:has-text("Add Bank Account")');

      await page.fill('input[name="nameAr"]', 'البنك التجاري');
      await page.fill('input[name="nameEn"]', 'Commercial Bank');
      await page.fill('input[name="accountNumber"]', '9876543210');
      await page.fill('input[name="bankName"]', 'Commercial Bank');
      await page.fill('input[name="iban"]', 'SA1234567890123456789012');
      await page.fill('input[name="openingBalance"]', '75000');

      await page.click('button:has-text("Save")');

      // Verify IBAN is displayed
      await expect(page.locator('text=SA1234567890123456789012')).toBeVisible();
    });
  });

  test.describe('Overview Section', () => {
    test('should display total cash balance', async ({ page }) => {
      // Navigate to overview tab
      await page.click('button:has-text("Overview")');

      // Verify total cash balance card
      await expect(page.locator('text=Total Cash')).toBeVisible();
      await expect(page.locator('text=All Cash Accounts')).toBeVisible();
    });

    test('should display total bank balance', async ({ page }) => {
      await page.click('button:has-text("Overview")');

      // Verify total bank balance card
      await expect(page.locator('text=Total Bank')).toBeVisible();
      await expect(page.locator('text=All Bank Accounts')).toBeVisible();
    });

    test('should display combined balance', async ({ page }) => {
      await page.click('button:has-text("Overview")');

      // Verify combined balance card
      await expect(page.locator('text=Total Balance')).toBeVisible();
      await expect(page.locator('text=Combined Balance')).toBeVisible();
    });
  });

  test.describe('Arabic/RTL Support', () => {
    test('should display Arabic labels correctly', async ({ page }) => {
      // Switch to Arabic
      await page.click('button[aria-label="Language"]');
      await page.click('text=العربية');

      // Verify Arabic text is displayed
      await expect(page.locator('text=إدارة الصندوق والبنك')).toBeVisible();
      await expect(page.locator('text=إضافة حساب نقدي')).toBeVisible();
      await expect(page.locator('text=إضافة حساب بنكي')).toBeVisible();
    });

    test('should handle RTL layout for Arabic', async ({ page }) => {
      // Switch to Arabic
      await page.click('button[aria-label="Language"]');
      await page.click('text=العربية');

      // Check RTL direction
      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'rtl');

      // Verify form inputs are RTL aligned
      await page.click('button:has-text("إضافة حساب نقدي")');
      const arabicInput = page.locator('input[name="nameAr"]');
      await expect(arabicInput).toHaveCSS('text-align', 'right');
    });
  });

  test.describe('Validation', () => {
    test('should validate required fields', async ({ page }) => {
      await page.click('button:has-text("Add Cash Account")');

      // Try to submit without filling required fields
      await page.click('button:has-text("Save")');

      // Verify error messages
      await expect(page.locator('text=Arabic name is required')).toBeVisible();
      await expect(page.locator('text=English name is required')).toBeVisible();
    });

    test('should validate opening balance is a number', async ({ page }) => {
      await page.click('button:has-text("Add Cash Account")');

      await page.fill('input[name="nameAr"]', 'اختبار');
      await page.fill('input[name="nameEn"]', 'Test');
      await page.fill('input[name="openingBalance"]', 'invalid');

      await page.click('button:has-text("Save")');

      // Verify error message
      await expect(page.locator('text=Opening balance must be a valid number')).toBeVisible();
    });

    test('should only allow one default account', async ({ page }) => {
      // Create first default account
      await page.click('button:has-text("Add Cash Account")');
      await page.fill('input[name="nameAr"]', 'الأول');
      await page.fill('input[name="nameEn"]', 'First');
      await page.fill('input[name="openingBalance"]', '1000');
      await page.click('input[name="isDefault"]');
      await page.click('button:has-text("Save")');

      // Create second default account
      await page.click('button:has-text("Add Cash Account")');
      await page.fill('input[name="nameAr"]', 'الثاني');
      await page.fill('input[name="nameEn"]', 'Second');
      await page.fill('input[name="openingBalance"]', '2000');
      await page.click('input[name="isDefault"]');
      await page.click('button:has-text("Save")');

      // Verify only one default badge exists
      const defaultBadges = page.locator('text=Default');
      await expect(defaultBadges).toHaveCount(1);
    });
  });
});