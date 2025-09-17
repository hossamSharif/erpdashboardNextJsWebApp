import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the main heading and description', async ({ page }) => {
    await page.goto('/')

    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Multi-Shop Accounting')

    // Check description
    await expect(page.getByText('ERP Dashboard Application')).toBeVisible()
  })

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle('Multi-Shop Accounting')

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', 'ERP Dashboard for Multi-Shop Accounting')
  })

  test('should be responsive', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})