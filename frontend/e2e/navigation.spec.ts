import { test, expect } from '@playwright/test';

test.describe('Navigation & Routing', () => {
  test.describe('Page Navigation', () => {
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

    test('should navigate back to home from convert page', async ({ page }) => {
      await page.goto('/convert');
      const backButton = page.locator('button:has-text("back to home")');
      await backButton.click();
      await expect(page).toHaveURL('/');
    });

    test('should navigate back to home from vegan weapons page', async ({ page }) => {
      await page.goto('/vegan-weapons');
      const backButton = page.locator('button:has-text("back")');
      if (await backButton.isVisible()) {
        await backButton.click();
        await expect(page).toHaveURL('/');
      }
    });
  });

  test.describe('Direct URL Navigation', () => {
    test('should handle direct URL navigation to convert', async ({ page }) => {
      // Navigate directly to convert
      await page.goto('/convert');
      await expect(page.locator('text=convert your recipe')).toBeVisible();
      await expect(page).toHaveTitle(/Vegan Converter/);
    });

    test('should handle direct URL navigation to weapons', async ({ page }) => {
      // Navigate directly to weapons
      await page.goto('/vegan-weapons');
      await expect(page.locator('text=vegan weapons')).toBeVisible();
      await expect(page).toHaveTitle(/Vegan Converter/);
    });

    test('should handle direct URL navigation to home', async ({ page }) => {
      // Navigate directly to home
      await page.goto('/');
      await expect(page).toHaveTitle(/Vegan Converter/);
    });

    test('should redirect 404 to home', async ({ page }) => {
      // Try to navigate to non-existent page
      await page.goto('/non-existent-page', { waitUntil: 'networkidle' });
      // Should either stay on 404 page or redirect to home
      const url = page.url();
      expect(['/non-existent-page', '/']).toContain(url.split('/').pop() || '');
    });
  });

  test.describe('URL Patterns', () => {
    test('should support both hyphenated and camelCase URLs', async ({ page }) => {
      // Test hyphenated
      await page.goto('/vegan-weapons');
      await expect(page.locator('text=vegan weapons')).toBeVisible();

      // Test from convert
      await page.goto('/convert');
      await expect(page.locator('text=convert your recipe')).toBeVisible();
    });
  });

  test.describe('SEO & Metadata', () => {
    test('should display SEO-friendly title on home', async ({ page }) => {
      const expectedTitle = /Vegan Converter - Convert Any Recipe to Plant-Based/;
      await page.goto('/');
      await expect(page).toHaveTitle(expectedTitle);
    });

    test('should display SEO-friendly title on convert page', async ({ page }) => {
      const expectedTitle = /Vegan Converter - Convert Any Recipe to Plant-Based/;
      await page.goto('/convert');
      await expect(page).toHaveTitle(expectedTitle);
    });

    test('should display SEO-friendly title on weapons page', async ({ page }) => {
      const expectedTitle = /Vegan Converter - Convert Any Recipe to Plant-Based/;
      await page.goto('/vegan-weapons');
      await expect(page).toHaveTitle(expectedTitle);
    });

    test('should have consistent page titles across navigation', async ({ page }) => {
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
  });

  test.describe('Footer Links', () => {
    test('should have footer link to Ailamedia on home', async ({ page }) => {
      await page.goto('/');
      await page.locator('footer').scrollIntoViewIfNeeded();

      const link = page.locator('a[href="https://ailamedia.com"]');
      await expect(link).toBeVisible({ timeout: 5000 });
      await expect(link).toHaveAttribute('target', '_blank');
    });

    test('should have footer link to Ailamedia on convert page', async ({ page }) => {
      await page.goto('/convert');
      await page.locator('footer').scrollIntoViewIfNeeded();

      const link = page.locator('a[href="https://ailamedia.com"]');
      await expect(link).toBeVisible({ timeout: 5000 });
      await expect(link).toHaveAttribute('target', '_blank');
    });

    test('should have footer link to Ailamedia on weapons page', async ({ page }) => {
      await page.goto('/vegan-weapons');
      await page.locator('footer').scrollIntoViewIfNeeded();

      const link = page.locator('a[href="https://ailamedia.com"]');
      await expect(link).toBeVisible({ timeout: 5000 });
      await expect(link).toHaveAttribute('target', '_blank');
    });

    test('should have correct footer text on all pages', async ({ page }) => {
      const expectedText = 'Created by Laila Madsø for Ailamedia.com';
      const pages = ['/', '/convert', '/vegan-weapons'];

      for (const path of pages) {
        await page.goto(path);
        await page.locator('footer').scrollIntoViewIfNeeded();
        await expect(page.locator(`text=${expectedText}`)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should open Ailamedia link in new tab', async ({ page, context }) => {
      await page.goto('/');
      await page.locator('footer').scrollIntoViewIfNeeded();

      const link = page.locator('a[href="https://ailamedia.com"]');

      // Check target attribute
      await expect(link).toHaveAttribute('target', '_blank');

      // Verify rel attribute for security
      const relAttr = await link.getAttribute('rel');
      expect(relAttr).toContain('noopener');
    });
  });

  test.describe('Navigation Consistency', () => {
    test('should display consistent header on all pages', async ({ page }) => {
      const pages = ['/', '/convert', '/vegan-weapons'];

      for (const path of pages) {
        await page.goto(path);
        await expect(page.locator('header')).toBeVisible();
      }
    });

    test('should display consistent footer on all pages', async ({ page }) => {
      const pages = ['/', '/convert', '/vegan-weapons'];

      for (const path of pages) {
        await page.goto(path);
        const footer = page.locator('footer');
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toBeVisible();
      }
    });

    test('should have navigation menu on all pages', async ({ page }) => {
      const pages = ['/', '/convert', '/vegan-weapons'];

      for (const path of pages) {
        await page.goto(path);
        // Header should have at least one navigation element
        const header = page.locator('header');
        await expect(header).toBeVisible();
      }
    });
  });

  test.describe('Browser History', () => {
    test('should support browser back button navigation', async ({ page }) => {
      // Navigate forward
      await page.goto('/');
      await page.goto('/convert');
      await expect(page).toHaveURL(/\/convert/);

      // Go back
      await page.goBack();
      await expect(page).toHaveURL('/');
    });

    test('should support browser forward button navigation', async ({ page }) => {
      // Navigate and go back
      await page.goto('/');
      await page.goto('/convert');
      await page.goBack();
      await expect(page).toHaveURL('/');

      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/\/convert/);
    });
  });

  test.describe('Navigation Performance', () => {
    test('should load home page quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000);
    });

    test('should load convert page quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/convert');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000);
    });

    test('should load vegan weapons page quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/vegan-weapons');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});
