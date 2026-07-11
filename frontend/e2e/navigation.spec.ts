import { test, expect } from '@playwright/test';

test.describe('Navigation & Routing', () => {
  test('should navigate between pages using home links', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page).toHaveTitle(/Vegan Converter/);

    // Navigate to convert page
    const convertLink = page.locator('a:has-text("Convert")').first();
    if (await convertLink.isVisible()) {
      await convertLink.click();
      await expect(page).toHaveURL(/\/convert/);
      await expect(page.locator('text=convert your recipe')).toBeVisible();
    }
  });

  test('should navigate to vegan weapons page', async ({ page }) => {
    await page.goto('/');

    // Find and click weapons link
    const weaponsLink = page.locator('a:has-text("Weapons")').first();
    if (await weaponsLink.isVisible()) {
      await weaponsLink.click();
      await expect(page).toHaveURL(/\/vegan-weapons/);
    }
  });

  test('should handle direct URL navigation', async ({ page }) => {
    // Navigate directly to convert
    await page.goto('/convert');
    await expect(page.locator('text=convert your recipe')).toBeVisible();

    // Navigate directly to weapons
    await page.goto('/vegan-weapons');
    await expect(page.locator('text=vegan weapons')).toBeVisible();
  });

  test('should display SEO-friendly title on all pages', async ({ page }) => {
    const expectedTitle = /Vegan Converter - Convert Any Recipe to Plant-Based/;

    // Check home
    await page.goto('/');
    await expect(page).toHaveTitle(expectedTitle);

    // Check convert
    await page.goto('/convert');
    await expect(page).toHaveTitle(expectedTitle);

    // Check weapons
    await page.goto('/vegan-weapons');
    await expect(page).toHaveTitle(expectedTitle);
  });

  test('should have footer link to Ailamedia on all pages', async ({ page }) => {
    const pages = ['/', '/convert', '/vegan-weapons'];

    for (const path of pages) {
      await page.goto(path);
      await page.locator('footer').scrollIntoViewIfNeeded();

      const link = page.locator('a[href="https://ailamedia.com"]');
      await expect(link).toBeVisible({ timeout: 5000 });
      await expect(link).toHaveAttribute('target', '_blank');
    }
  });
});
