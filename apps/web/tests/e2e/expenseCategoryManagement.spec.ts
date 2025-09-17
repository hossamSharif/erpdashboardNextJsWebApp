import { test, expect } from '@playwright/test';

test.describe('Expense Category Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to expense category management
    await page.goto('/admin/expense-categories');
  });

  test.describe('Category Creation', () => {
    test('should create a new root level category', async ({ page }) => {
      // Click on Add Category button
      await page.click('button:has-text("Add Category")');

      // Fill in the form
      await page.fill('input[name="nameAr"]', 'المرافق العامة');
      await page.fill('input[name="nameEn"]', 'Public Utilities');
      await page.fill('input[name="code"]', 'UTILITIES');

      // Submit the form
      await page.click('button:has-text("Create")');

      // Verify the category appears in the tree view
      await expect(page.locator('text=Public Utilities')).toBeVisible();
      await expect(page.locator('text=UTILITIES')).toBeVisible();
      await expect(page.locator('text=Level 1')).toBeVisible();
    });

    test('should create a subcategory under parent', async ({ page }) => {
      // First create a parent category
      await page.click('button:has-text("Add Category")');
      await page.fill('input[name="nameAr"]', 'النقل والمواصلات');
      await page.fill('input[name="nameEn"]', 'Transportation');
      await page.fill('input[name="code"]', 'TRANSPORT');
      await page.click('button:has-text("Create")');

      // Wait for the parent to appear
      await expect(page.locator('text=Transportation')).toBeVisible();

      // Click on the actions menu for the parent category
      await page.locator('[data-testid="category-actions-TRANSPORT"]').click();
      await page.click('text=Add Subcategory');

      // Fill in the subcategory form
      await page.fill('input[name="nameAr"]', 'الوقود');
      await page.fill('input[name="nameEn"]', 'Fuel');
      await page.fill('input[name="code"]', 'TRANSPORT_FUEL');

      // Verify parent is pre-selected
      await expect(page.locator('text=TRANSPORT - Transportation')).toBeVisible();

      // Submit the form
      await page.click('button:has-text("Create")');

      // Verify the subcategory appears under the parent
      await expect(page.locator('text=Fuel')).toBeVisible();
      await expect(page.locator('text=Level 2')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('button:has-text("Add Category")');

      // Try to submit without required fields
      await page.click('button:has-text("Create")');

      // Should show validation errors
      await expect(page.locator('text=Arabic name is required')).toBeVisible();
      await expect(page.locator('text=English name is required')).toBeVisible();
      await expect(page.locator('text=Category code is required')).toBeVisible();
    });

    test('should convert code to uppercase automatically', async ({ page }) => {
      await page.click('button:has-text("Add Category")');

      // Type lowercase code
      await page.fill('input[name="code"]', 'lowercase_code');

      // Should automatically convert to uppercase
      await expect(page.locator('input[name="code"]')).toHaveValue('LOWERCASE_CODE');
    });

    test('should prevent creating more than 3 hierarchy levels', async ({ page }) => {
      // Create Level 1 category
      await page.click('button:has-text("Add Category")');
      await page.fill('input[name="nameAr"]', 'المستوى الأول');
      await page.fill('input[name="nameEn"]', 'Level One');
      await page.fill('input[name="code"]', 'LEVEL1');
      await page.click('button:has-text("Create")');

      // Create Level 2 category
      await page.locator('[data-testid="category-actions-LEVEL1"]').click();
      await page.click('text=Add Subcategory');
      await page.fill('input[name="nameAr"]', 'المستوى الثاني');
      await page.fill('input[name="nameEn"]', 'Level Two');
      await page.fill('input[name="code"]', 'LEVEL2');
      await page.click('button:has-text("Create")');

      // Create Level 3 category
      await page.locator('[data-testid="category-actions-LEVEL2"]').click();
      await page.click('text=Add Subcategory');
      await page.fill('input[name="nameAr"]', 'المستوى الثالث');
      await page.fill('input[name="nameEn"]', 'Level Three');
      await page.fill('input[name="code"]', 'LEVEL3');
      await page.click('button:has-text("Create")');

      // Level 3 category should not have "Add Subcategory" option
      await page.locator('[data-testid="category-actions-LEVEL3"]').click();
      await expect(page.locator('text=Add Subcategory')).not.toBeVisible();
    });
  });

  test.describe('Category Management', () => {
    test('should edit an existing category', async ({ page }) => {
      // Create a category first
      await page.click('button:has-text("Add Category")');
      await page.fill('input[name="nameAr"]', 'تصنيف للتعديل');
      await page.fill('input[name="nameEn"]', 'Category to Edit');
      await page.fill('input[name="code"]', 'EDIT_CAT');
      await page.click('button:has-text("Create")');

      // Edit the category
      await page.locator('[data-testid="category-actions-EDIT_CAT"]').click();
      await page.click('text=Edit');

      // Update the English name
      await page.fill('input[name="nameEn"]', 'Updated Category Name');
      await page.click('button:has-text("Update")');

      // Verify the update
      await expect(page.locator('text=Updated Category Name')).toBeVisible();
    });

    test('should toggle category status', async ({ page }) => {
      // Create a category first
      await page.click('button:has-text("Add Category")');
      await page.fill('input[name="nameAr"]', 'تصنيف للإلغاء');
      await page.fill('input[name="nameEn"]', 'Category to Deactivate');
      await page.fill('input[name="code"]', 'DEACTIVATE_CAT');
      await page.click('button:has-text("Create")');

      // Deactivate the category
      await page.locator('[data-testid="category-actions-DEACTIVATE_CAT"]').click();
      await page.click('text=Deactivate');

      // Verify the category is marked as inactive
      await expect(page.locator('text=Inactive')).toBeVisible();
    });

    test('should delete a category without children', async ({ page }) => {
      // Create a category first
      await page.click('button:has-text("Add Category")');
      await page.fill('input[name="nameAr"]', 'تصنيف للحذف');
      await page.fill('input[name="nameEn"]', 'Category to Delete');
      await page.fill('input[name="code"]', 'DELETE_CAT');
      await page.click('button:has-text("Create")');

      // Delete the category
      await page.locator('[data-testid="category-actions-DELETE_CAT"]').click();
      await page.click('text=Delete');

      // Confirm deletion in the dialog
      await page.click('button:has-text("Yes")');

      // Verify the category is removed
      await expect(page.locator('text=Category to Delete')).not.toBeVisible();
    });

    test('should prevent deletion of system categories', async ({ page }) => {
      // Assuming system categories are pre-created, try to delete one
      const systemCategoryActions = page.locator('[data-testid*="category-actions"]:has(text="System")').first();

      if (await systemCategoryActions.isVisible()) {
        await systemCategoryActions.click();
        // System categories should not have delete option
        await expect(page.locator('text=Delete')).not.toBeVisible();
      }
    });

    test('should prevent deletion of categories with children', async ({ page }) => {
      // Create a parent category
      await page.click('button:has-text("Add Category")');
      await page.fill('input[name="nameAr"]', 'تصنيف رئيسي');
      await page.fill('input[name="nameEn"]', 'Parent Category');
      await page.fill('input[name="code"]', 'PARENT_CAT');
      await page.click('button:has-text("Create")');

      // Create a child category
      await page.locator('[data-testid="category-actions-PARENT_CAT"]').click();
      await page.click('text=Add Subcategory');
      await page.fill('input[name="nameAr"]', 'تصنيف فرعي');
      await page.fill('input[name="nameEn"]', 'Child Category');
      await page.fill('input[name="code"]', 'CHILD_CAT');
      await page.click('button:has-text("Create")');

      // Try to delete the parent category
      await page.locator('[data-testid="category-actions-PARENT_CAT"]').click();

      // Delete option should not be available for categories with children
      await expect(page.locator('text=Delete')).not.toBeVisible();
    });
  });

  test.describe('View Modes', () => {
    test('should switch between tree and list views', async ({ page }) => {
      // Default should be tree view
      await expect(page.locator('[data-testid="tree-view"]')).toBeVisible();

      // Switch to list view
      await page.click('button:has-text("List View")');
      await expect(page.locator('[data-testid="list-view"]')).toBeVisible();

      // Switch back to tree view
      await page.click('button:has-text("Tree View")');
      await expect(page.locator('[data-testid="tree-view"]')).toBeVisible();
    });

    test('should filter categories in list view', async ({ page }) => {
      // Switch to list view
      await page.click('button:has-text("List View")');

      // Create some test categories first
      const categories = [
        { nameAr: 'الرواتب', nameEn: 'Salaries', code: 'SALARIES' },
        { nameAr: 'المرافق', nameEn: 'Utilities', code: 'UTILITIES' },
        { nameAr: 'النقل', nameEn: 'Transport', code: 'TRANSPORT' },
      ];

      for (const cat of categories) {
        await page.click('button:has-text("Add Category")');
        await page.fill('input[name="nameAr"]', cat.nameAr);
        await page.fill('input[name="nameEn"]', cat.nameEn);
        await page.fill('input[name="code"]', cat.code);
        await page.click('button:has-text("Create")');
      }

      // Search for a specific category
      await page.fill('input[placeholder*="Search"]', 'Utilities');
      await expect(page.locator('text=Utilities')).toBeVisible();
      await expect(page.locator('text=Salaries')).not.toBeVisible();
      await expect(page.locator('text=Transport')).not.toBeVisible();

      // Clear search
      await page.fill('input[placeholder*="Search"]', '');
      await expect(page.locator('text=Utilities')).toBeVisible();
      await expect(page.locator('text=Salaries')).toBeVisible();
      await expect(page.locator('text=Transport')).toBeVisible();
    });
  });

  test.describe('Bulk Import', () => {
    test('should import default categories', async ({ page }) => {
      // Click on bulk import
      await page.click('button:has-text("Bulk Import")');

      // Click on create defaults
      await page.click('button:has-text("Create Defaults")');

      // Should show success message
      await expect(page.locator('text=Default categories created')).toBeVisible();

      // Verify some default categories appear
      await page.click('button:has-text("Close")');
      await expect(page.locator('text=Salaries')).toBeVisible();
      await expect(page.locator('text=Utilities')).toBeVisible();
      await expect(page.locator('text=Transportation')).toBeVisible();
    });

    test('should download template', async ({ page }) => {
      await page.click('button:has-text("Bulk Import")');

      // Set up download handling
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download Template")');
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toBe('expense-categories-template.json');
    });

    test('should import categories from JSON', async ({ page }) => {
      await page.click('button:has-text("Bulk Import")');

      // Fill in JSON data
      const jsonData = JSON.stringify([
        {
          nameAr: 'الإيجار',
          nameEn: 'Rent',
          code: 'RENT',
          level: 1,
        },
        {
          nameAr: 'التأمين',
          nameEn: 'Insurance',
          code: 'INSURANCE',
          level: 1,
        },
      ]);

      await page.fill('textarea[placeholder*="import data"]', jsonData);
      await page.click('button:has-text("Import")');

      // Should show success message
      await expect(page.locator('text=Import successful')).toBeVisible();
      await expect(page.locator('text=Created: 2')).toBeVisible();

      // Close modal and verify categories
      await page.click('button:has-text("Close")');
      await expect(page.locator('text=Rent')).toBeVisible();
      await expect(page.locator('text=Insurance')).toBeVisible();
    });

    test('should handle import errors gracefully', async ({ page }) => {
      await page.click('button:has-text("Bulk Import")');

      // Fill in invalid JSON data
      await page.fill('textarea[placeholder*="import data"]', 'invalid json');
      await page.click('button:has-text("Import")');

      // Should show error message
      await expect(page.locator('text=Invalid import data')).toBeVisible();
    });
  });

  test.describe('Arabic RTL Support', () => {
    test('should display Arabic text correctly in RTL', async ({ page }) => {
      // Create a category with Arabic text
      await page.click('button:has-text("Add Category")');
      await page.fill('input[name="nameAr"]', 'المصاريف الإدارية والعمومية');
      await page.fill('input[name="nameEn"]', 'Administrative and General Expenses');
      await page.fill('input[name="code"]', 'ADMIN_GENERAL');
      await page.click('button:has-text("Create")');

      // Verify Arabic text appears with correct RTL direction
      const arabicText = page.locator('text=المصاريف الإدارية والعمومية');
      await expect(arabicText).toBeVisible();

      // Check that Arabic input has RTL direction
      const arabicInput = page.locator('input[name="nameAr"]');
      await expect(arabicInput).toHaveAttribute('dir', 'rtl');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigation should be responsive
      await expect(page.locator('button:has-text("Add Category")')).toBeVisible();

      // Create a category on mobile
      await page.click('button:has-text("Add Category")');
      await page.fill('input[name="nameAr"]', 'تصنيف محمول');
      await page.fill('input[name="nameEn"]', 'Mobile Category');
      await page.fill('input[name="code"]', 'MOBILE_CAT');
      await page.click('button:has-text("Create")');

      // Verify category appears
      await expect(page.locator('text=Mobile Category')).toBeVisible();
    });
  });
});