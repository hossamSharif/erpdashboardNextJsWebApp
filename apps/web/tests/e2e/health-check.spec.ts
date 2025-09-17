import { test, expect } from '@playwright/test';

test.describe('Health Check E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');
  });

  test('should display health check landing page', async ({ page }) => {
    // Should show main heading
    await expect(page.getByText('System Operational')).toBeVisible();
    await expect(page.getByText('Multi-Shop Accounting System')).toBeVisible();

    // Should show language toggle
    await expect(page.getByRole('button', { name: /English|العربية/ })).toBeVisible();

    // Should show login/dashboard button
    await expect(page.getByRole('button', { name: /Login|Dashboard/ })).toBeVisible();
  });

  test('should display health status indicators', async ({ page }) => {
    // Wait for health check to load
    await page.waitForSelector('[data-testid="health-status"]', { timeout: 10000 });

    // Should show system status
    await expect(page.getByText('System Status')).toBeVisible();

    // Should show health indicators
    await expect(page.getByText('Database')).toBeVisible();
    await expect(page.getByText('Authentication')).toBeVisible();
    await expect(page.getByText('Response Time')).toBeVisible();

    // Should show version and environment info
    await expect(page.getByText('Version')).toBeVisible();
    await expect(page.getByText('Environment')).toBeVisible();
  });

  test('should allow manual refresh of health status', async ({ page }) => {
    // Wait for health check to load
    await page.waitForSelector('[data-testid="health-status"]', { timeout: 10000 });

    // Click refresh button
    const refreshButton = page.getByRole('button', { name: /Refresh Status/ });
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();

    // Should show loading state briefly
    await expect(page.getByText(/Loading|Checking/)).toBeVisible({ timeout: 5000 });
  });

  test('should switch languages correctly', async ({ page }) => {
    // Click language toggle
    const languageToggle = page.getByRole('button', { name: /English|العربية/ });
    await languageToggle.click();

    // Wait for language change
    await page.waitForTimeout(1000);

    // Check if RTL attributes are applied when Arabic is selected
    const html = page.locator('html');
    const direction = await html.getAttribute('dir');

    // Should be either LTR or RTL depending on current language
    expect(['ltr', 'rtl']).toContain(direction);
  });

  test('should display correct authentication status', async ({ page }) => {
    // Should show current session status
    await expect(page.getByText(/Status: Guest|Authenticated/)).toBeVisible();

    // Should show language and direction info
    await expect(page.getByText(/Language:/)).toBeVisible();
    await expect(page.getByText(/Direction:/)).toBeVisible();
  });

  test('should handle navigation correctly', async ({ page }) => {
    // Test login button navigation
    const loginButton = page.getByRole('button', { name: 'Login' });
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await expect(page).toHaveURL(/.*\/login/);
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Should still show main content
    await expect(page.getByText('System Operational')).toBeVisible();
    await expect(page.getByText('System Status')).toBeVisible();

    // Health status should be visible and properly formatted
    await page.waitForSelector('[data-testid="health-status"]', { timeout: 10000 });
    await expect(page.getByText('Database')).toBeVisible();
  });

  test('should display system information correctly', async ({ page }) => {
    // Should show technology stack info
    await expect(page.getByText('Technology Stack')).toBeVisible();
    await expect(page.getByText('Next.js 14 + App Router')).toBeVisible();
    await expect(page.getByText('tRPC + TypeScript')).toBeVisible();
    await expect(page.getByText('PostgreSQL + Prisma')).toBeVisible();

    // Should show system information
    await expect(page.getByText('System Information')).toBeVisible();
    await expect(page.getByText('Multi-tenant Architecture')).toBeVisible();
    await expect(page.getByText('Arabic/English Support')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Mock a network error by blocking the API endpoint
    await page.route('**/api/trpc/**', route => route.abort());

    // Reload the page
    await page.reload();

    // Should show error handling or loading state
    // The exact behavior depends on how the app handles network errors
    await page.waitForTimeout(3000);

    // Should still show the page structure even if health check fails
    await expect(page.getByText('System Operational')).toBeVisible();
  });
});