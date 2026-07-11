import { test, expect } from '@playwright/test';

test.describe('Vegan Weapons Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vegan-weapons');
  });

  test('should load vegan weapons page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Vegan Converter/);
    await expect(page.locator('text=vegan weapons library')).toBeVisible();
  });

  test('should display weapons list', async ({ page }) => {
    // Wait for weapons to load
    await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });

    // Check that multiple cards are visible
    const cards = page.locator('div').filter({ has: page.locator('text=View Recipe') });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter weapons by category', async ({ page }) => {
    // Wait for category buttons to load
    const categoryButtons = page.locator('button').filter({ hasText: /^\w+$/ });

    // Get first category button (skip "all" if present)
    const firstCategory = categoryButtons.first();
    await expect(firstCategory).toBeVisible();

    // Click it
    await firstCategory.click();

    // Weapons should still be visible
    await expect(page.locator('text=View Recipe').first()).toBeVisible();
  });

  test('should have back button to home', async ({ page }) => {
    const backButton = page.locator('button:has-text("back")');
    await expect(backButton).toBeVisible();
  });

  test('should display footer with Ailamedia link', async ({ page }) => {
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();

    // Check for footer text
    await expect(page.locator('text=Created by Laila Madsø for Ailamedia.com')).toBeVisible();

    // Check for link
    const link = page.locator('a[href="https://ailamedia.com"]');
    await expect(link).toBeVisible();
  });
});
