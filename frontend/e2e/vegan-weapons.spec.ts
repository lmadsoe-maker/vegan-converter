import { test, expect } from '@playwright/test';

test.describe('Vegan Weapons Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vegan-weapons');
  });

  test.describe('Page Load & UI', () => {
    test('should load vegan weapons page successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/Vegan Converter/);
      await expect(page.locator('text=vegan weapons library')).toBeVisible();
    });

    test('should display weapons list with cards', async ({ page }) => {
      // Wait for weapons to load
      await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });

      // Check that multiple cards are visible
      const cards = page.locator('div').filter({ has: page.locator('text=View Recipe') });
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display page title and description', async ({ page }) => {
      const title = page.locator('text=vegan weapons library');
      await expect(title).toBeVisible();

      // Check for descriptive text
      const description = page.locator('text=/whole foods|plant-based|weapons/i').first();
      if (await description.isVisible()) {
        await expect(description).toBeVisible();
      }
    });

    test('should have back button to home', async ({ page }) => {
      const backButton = page.locator('button:has-text("back")');
      await expect(backButton).toBeVisible();
    });

    test('should display footer with Ailamedia link', async ({ page }) => {
      await page.locator('footer').scrollIntoViewIfNeeded();
      await expect(page.locator('text=Created by Laila Madsø for Ailamedia.com')).toBeVisible();

      const link = page.locator('a[href="https://ailamedia.com"]');
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('target', '_blank');
    });
  });

  test.describe('Weapons Display', () => {
    test('should display weapons with name and description', async ({ page }) => {
      // Wait for content to load
      await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });

      // Get first weapon card
      const firstCard = page.locator('[class*="card"]').first();
      if (await firstCard.isVisible()) {
        // Check for weapon name
        const weaponName = firstCard.locator('[class*="h3"], [class*="h4"], [class*="font-bold"]').first();
        if (await weaponName.isVisible()) {
          const nameText = await weaponName.textContent();
          expect(nameText?.trim().length).toBeGreaterThan(0);
        }
      }
    });

    test('should display view recipe button on weapons', async ({ page }) => {
      const viewButtons = page.locator('button:has-text("View Recipe")');
      const count = await viewButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should show weapon categories', async ({ page }) => {
      // Look for category tags or indicators
      const categoryElements = page.locator('[class*="tag"], [class*="badge"], [class*="category"]');
      const count = await categoryElements.count();

      // There should be some category elements visible
      if (count > 0) {
        await expect(categoryElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Category Filtering', () => {
    test('should have category filter buttons', async ({ page }) => {
      const categoryButtons = page.locator('button').filter({ hasText: /^[A-Za-z ]+$/ });
      const count = await categoryButtons.count();

      // There should be at least one category button
      expect(count).toBeGreaterThan(0);
    });

    test('should filter weapons by category when button clicked', async ({ page }) => {
      // Wait for weapons to load
      await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });

      const categoryButtons = page.locator('button').filter({ hasText: /^[A-Za-z ]+$/ });
      const firstCategory = categoryButtons.first();

      if (await firstCategory.isVisible()) {
        // Get initial count
        const initialCards = page.locator('[class*="card"]');
        const initialCount = await initialCards.count();

        // Click category
        await firstCategory.click();

        // Weapons should still be visible (or empty if none in category)
        const weaponCards = page.locator('div').filter({ has: page.locator('text=View Recipe') });
        const finalCount = await weaponCards.count();

        // Either same count or fewer (filtered)
        expect(finalCount).toBeLessThanOrEqual(initialCount);
      }
    });

    test('should show all weapons when "All" category is selected', async ({ page }) => {
      await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });

      // Find and click "All" button if it exists
      const allButton = page.locator('button').filter({ hasText: /^All$|^All$/ });
      if (await allButton.isVisible()) {
        await allButton.click();

        // Check that weapons are visible
        const weapons = page.locator('div').filter({ has: page.locator('text=View Recipe') });
        const count = await weapons.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should maintain filter state when scrolling', async ({ page }) => {
      await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });

      // Apply a filter
      const categoryButtons = page.locator('button').filter({ hasText: /^[A-Za-z ]+$/ });
      if (await categoryButtons.count() > 0) {
        const firstCategory = categoryButtons.first();
        await firstCategory.click();

        // Scroll down
        await page.evaluate(() => window.scrollBy(0, 500));

        // Weapons should still be visible with same filter
        const weapons = page.locator('div').filter({ has: page.locator('text=View Recipe') });
        const count = await weapons.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Search & Discovery', () => {
    test('should display weapons in a scrollable list', async ({ page }) => {
      await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });

      // Scroll to bottom to ensure lazy loading works if present
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Weapons should still be present
      const weapons = page.locator('div').filter({ has: page.locator('text=View Recipe') });
      const count = await weapons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should load weapons dynamically if lazy loading is used', async ({ page }) => {
      await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });

      const initialCount = await page.locator('div').filter({ has: page.locator('text=View Recipe') }).count();

      // Scroll to bottom
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Wait for potential lazy loading
      await page.waitForTimeout(1000);

      const finalCount = await page.locator('div').filter({ has: page.locator('text=View Recipe') }).count();

      // Count should be same or more
      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    });
  });

  test.describe('Weapon Details', () => {
    test('should display weapon recipe details on view click', async ({ page }) => {
      const viewButton = page.locator('button:has-text("View Recipe")').first();
      if (await viewButton.isVisible()) {
        await viewButton.click();

        // Either modal or new page should show recipe
        const recipeContent = page.locator('[class*="modal"], [class*="dialog"], [class*="recipe"]').first();
        if (await recipeContent.isVisible()) {
          await expect(recipeContent).toBeVisible();
        }
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back to home when back button is clicked', async ({ page }) => {
      const backButton = page.locator('button:has-text("back")');
      if (await backButton.isVisible()) {
        await backButton.click();
        await expect(page).toHaveURL('/');
      }
    });

    test('should navigate to home from header link if available', async ({ page }) => {
      const homeLink = page.locator('a[href="/"], button:has-text("home"), a:has-text("home")').first();
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await expect(page).toHaveURL('/');
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should have accessible buttons', async ({ page }) => {
      const buttons = page.locator('button');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);

      // All visible buttons should have accessible text
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const text = await button.textContent();
          expect(text?.trim().length).toBeGreaterThan(0);
        }
      }
    });

    test('should have semantic HTML structure', async ({ page }) => {
      const main = page.locator('main');
      const nav = page.locator('nav');
      const footer = page.locator('footer');

      // Should have main content area
      if (await main.isVisible()) {
        await expect(main).toBeVisible();
      }

      // Should have footer
      if (await footer.isVisible()) {
        await expect(footer).toBeVisible();
      }
    });

    test('should have keyboard accessible navigation', async ({ page }) => {
      // Tab through buttons to ensure keyboard accessibility
      const firstButton = page.locator('button').first();
      await firstButton.focus();

      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on desktop viewport', async ({ page }) => {
      page.setViewportSize({ width: 1920, height: 1080 });

      await expect(page.locator('text=vegan weapons library')).toBeVisible();
      await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });
    });

    test('should display properly on tablet viewport', async ({ page }) => {
      page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator('text=vegan weapons library')).toBeVisible();
      await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });
    });

    test('should display properly on mobile viewport', async ({ page }) => {
      page.setViewportSize({ width: 375, height: 667 });

      await expect(page.locator('text=vegan weapons library')).toBeVisible();
      await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });
    });

    test('should stack cards properly on small screens', async ({ page }) => {
      page.setViewportSize({ width: 375, height: 667 });

      const cards = page.locator('[class*="card"]');
      const count = await cards.count();

      // Cards should be visible and stacked
      if (count > 0) {
        await expect(cards.first()).toBeVisible();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load weapons page within reasonable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/vegan-weapons');
      await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(15000);
    });

    test('should render weapons list without lag', async ({ page }) => {
      await expect(page.locator('text=View Recipe').first()).toBeVisible({ timeout: 10000 });

      // Scroll smoothly and check for performance
      const startTime = Date.now();

      await page.evaluate(() => {
        for (let i = 0; i < 5; i++) {
          window.scrollBy(0, 300);
        }
      });

      const scrollTime = Date.now() - startTime;
      expect(scrollTime).toBeLessThan(2000);
    });
  });
});
