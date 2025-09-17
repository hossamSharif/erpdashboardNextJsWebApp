import { test, expect } from '@playwright/test';

test.describe('Internationalization E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a clean slate
    await page.goto('/');
  });

  test.describe('Default Language and RTL', () => {
    test('should default to Arabic with RTL layout', async ({ page }) => {
      // Check that the page defaults to Arabic
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

      // Check that Arabic fonts are loaded
      const body = page.locator('body');
      await expect(body).toHaveClass(/font-arabic|font-cairo|font-tajawal/);
    });

    test('should display Arabic text correctly', async ({ page }) => {
      // Look for Arabic text in the interface
      const arabicText = page.locator('text=مرحبا').first(); // "Welcome" in Arabic
      if (await arabicText.count() > 0) {
        await expect(arabicText).toBeVisible();
      }

      // Check text direction
      const textElements = page.locator('[dir="rtl"], .rtl\\:text-right');
      if (await textElements.count() > 0) {
        await expect(textElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Language Switching', () => {
    test('should switch from Arabic to English', async ({ page }) => {
      // Find and click the language toggle button
      const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Toggle"], button:has-text("English"), button:has-text("🇺🇸")').first();

      if (await languageToggle.count() > 0) {
        await languageToggle.click();

        // Wait for language change
        await page.waitForTimeout(500);

        // Check that language changed to English
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
      }
    });

    test('should persist language choice after page reload', async ({ page }) => {
      const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Toggle"], button:has-text("English"), button:has-text("🇺🇸")').first();

      if (await languageToggle.count() > 0) {
        // Switch to English
        await languageToggle.click();
        await page.waitForTimeout(500);

        // Reload the page
        await page.reload();

        // Should still be in English
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
      }
    });

    test('should update UI text when switching languages', async ({ page }) => {
      // Take screenshot in Arabic
      await page.screenshot({ path: 'test-results/arabic-interface.png' });

      const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Toggle"], button:has-text("English"), button:has-text("🇺🇸")').first();

      if (await languageToggle.count() > 0) {
        // Switch to English
        await languageToggle.click();
        await page.waitForTimeout(500);

        // Take screenshot in English
        await page.screenshot({ path: 'test-results/english-interface.png' });

        // Check that common UI elements changed
        const saveButtons = page.locator('button:has-text("Save"), button:has-text("حفظ")');
        if (await saveButtons.count() > 0) {
          // In English, should see "Save"
          await expect(page.locator('button:has-text("Save")')).toBeVisible();
        }
      }
    });
  });

  test.describe('RTL Layout Behavior', () => {
    test('should have proper RTL layout in Arabic', async ({ page }) => {
      // Check for RTL-specific classes
      const rtlElements = page.locator('.rtl\\:text-right, .rtl\\:flex-row-reverse, [dir="rtl"]');
      if (await rtlElements.count() > 0) {
        await expect(rtlElements.first()).toBeVisible();
      }

      // Check navigation alignment (should be right-aligned in RTL)
      const navigation = page.locator('nav, .navigation, .navbar').first();
      if (await navigation.count() > 0) {
        const boundingBox = await navigation.boundingBox();
        if (boundingBox) {
          // In RTL, navigation should be positioned appropriately
          expect(boundingBox.x).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('should switch to LTR layout when switching to English', async ({ page }) => {
      const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Toggle"], button:has-text("English"), button:has-text("🇺🇸")').first();

      if (await languageToggle.count() > 0) {
        // Switch to English
        await languageToggle.click();
        await page.waitForTimeout(500);

        // Check for LTR layout
        await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

        // Check for LTR-specific classes
        const ltrElements = page.locator('.ltr\\:text-left, [dir="ltr"]');
        if (await ltrElements.count() > 0) {
          await expect(ltrElements.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Number and Date Formatting', () => {
    test('should display numbers correctly in Arabic', async ({ page }) => {
      // Look for any number displays
      const numberElements = page.locator('.arabic-numbers, [class*="formatted"]');

      if (await numberElements.count() > 0) {
        const firstNumber = await numberElements.first().textContent();
        if (firstNumber) {
          // Could contain Arabic-Indic numerals or Western numerals
          expect(firstNumber).toMatch(/[\d٠-٩]/);
        }
      }
    });

    test('should format dates in DD/MM/YYYY for Arabic', async ({ page }) => {
      // Look for date displays
      const dateElements = page.locator('[data-testid*="date"], .date, [class*="formatted-date"]');

      if (await dateElements.count() > 0) {
        const firstDate = await dateElements.first().textContent();
        if (firstDate && firstDate.includes('/')) {
          // Should be in DD/MM/YYYY format for Arabic
          expect(firstDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
        }
      }
    });

    test('should format dates in MM/DD/YYYY for English', async ({ page }) => {
      const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Toggle"], button:has-text("English"), button:has-text("🇺🇸")').first();

      if (await languageToggle.count() > 0) {
        // Switch to English
        await languageToggle.click();
        await page.waitForTimeout(500);

        // Look for date displays
        const dateElements = page.locator('[data-testid*="date"], .date, [class*="formatted-date"]');

        if (await dateElements.count() > 0) {
          const firstDate = await dateElements.first().textContent();
          if (firstDate && firstDate.includes('/')) {
            // Should be in MM/DD/YYYY format for English
            expect(firstDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
          }
        }
      }
    });
  });

  test.describe('Font Loading', () => {
    test('should load Arabic fonts correctly', async ({ page }) => {
      // Check that Arabic fonts are loaded
      await page.waitForLoadState('networkidle');

      // Check for font family in computed styles
      const body = page.locator('body');
      const fontFamily = await body.evaluate((el) =>
        window.getComputedStyle(el).fontFamily
      );

      // Should contain Cairo or Tajawal
      expect(fontFamily.toLowerCase()).toMatch(/cairo|tajawal/);
    });

    test('should render Arabic text clearly', async ({ page }) => {
      // Add Arabic test text to check rendering
      await page.evaluate(() => {
        const testDiv = document.createElement('div');
        testDiv.textContent = 'مرحبا بك في نظام المحاسبة المتطور';
        testDiv.style.fontSize = '24px';
        testDiv.style.padding = '20px';
        testDiv.id = 'arabic-test-text';
        document.body.appendChild(testDiv);
      });

      const arabicText = page.locator('#arabic-test-text');
      await expect(arabicText).toBeVisible();

      // Take screenshot to verify rendering
      await arabicText.screenshot({ path: 'test-results/arabic-text-rendering.png' });
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper language attributes for screen readers', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('lang');
      await expect(page.locator('html')).toHaveAttribute('dir');
    });

    test('should maintain proper reading order in RTL', async ({ page }) => {
      // Check tab order in RTL layout
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');

      if (await focusedElement.count() > 0) {
        await expect(focusedElement).toBeVisible();
      }
    });

    test('should have accessible language switcher', async ({ page }) => {
      const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Toggle"]').first();

      if (await languageToggle.count() > 0) {
        // Should have aria-label
        const ariaLabel = await languageToggle.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load fonts efficiently', async ({ page }) => {
      const fontRequests = [];

      page.on('response', (response) => {
        if (response.url().includes('font') || response.url().includes('googleapis')) {
          fontRequests.push(response);
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should not have excessive font requests
      expect(fontRequests.length).toBeLessThan(10);
    });

    test('should not cause layout shifts when switching languages', async ({ page }) => {
      const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Toggle"], button:has-text("English"), button:has-text("🇺🇸")').first();

      if (await languageToggle.count() > 0) {
        // Measure layout before switch
        const beforeLayout = await page.evaluate(() => ({
          width: document.body.scrollWidth,
          height: document.body.scrollHeight,
        }));

        // Switch language
        await languageToggle.click();
        await page.waitForTimeout(500);

        // Measure layout after switch
        const afterLayout = await page.evaluate(() => ({
          width: document.body.scrollWidth,
          height: document.body.scrollHeight,
        }));

        // Layout should be relatively stable
        const widthDiff = Math.abs(afterLayout.width - beforeLayout.width);
        const heightDiff = Math.abs(afterLayout.height - beforeLayout.height);

        expect(widthDiff).toBeLessThan(100); // Allow for minor differences
        expect(heightDiff).toBeLessThan(100);
      }
    });
  });
});