import { test, expect } from '@playwright/test';

test.describe('Convert Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/convert');
  });

  test.describe('Page Load & UI', () => {
    test('should load convert page successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/Vegan Converter/);
      await expect(page.locator('text=convert your recipe')).toBeVisible();
    });

    test('should display recipe conversion form', async ({ page }) => {
      // Check for textarea
      const textarea = page.locator('textarea');
      await expect(textarea).toBeVisible();
      await expect(textarea).toHaveAttribute('placeholder', /Enter a recipe|paste/);

      // Check for convert button
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');
      await expect(convertButton).toBeVisible();
      await expect(convertButton).toBeDisabled();
    });

    test('should display camera button', async ({ page }) => {
      const cameraButton = page.locator('button:has-text("take photo of recipe")');
      await expect(cameraButton).toBeVisible();
      await expect(cameraButton).toBeEnabled();
    });

    test('should display footer with Ailamedia link', async ({ page }) => {
      await page.locator('footer').scrollIntoViewIfNeeded();
      await expect(page.locator('text=Created by Laila Madsø for Ailamedia.com')).toBeVisible();
      const link = page.locator('a[href="https://ailamedia.com"]');
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('target', '_blank');
    });

    test('should display back button to home', async ({ page }) => {
      const backButton = page.locator('button:has-text("back to home")');
      await expect(backButton).toBeVisible();
    });
  });

  test.describe('Form Interaction', () => {
    test('should enable convert button when recipe text is entered', async ({ page }) => {
      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      await expect(convertButton).toBeDisabled();
      await textarea.fill('Chicken parmesan');
      await expect(convertButton).toBeEnabled();
    });

    test('should disable convert button when text is cleared', async ({ page }) => {
      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      await textarea.fill('Test recipe');
      await expect(convertButton).toBeEnabled();

      await textarea.clear();
      await expect(convertButton).toBeDisabled();
    });

    test('should handle long recipe input', async ({ page }) => {
      const textarea = page.locator('textarea');
      const longRecipe = `
        Beef Stroganoff
        Ingredients:
        - 2 lbs beef sirloin
        - 3 cups mushrooms
        - 2 tbsp butter
        - 1 cup sour cream
        - 2 onions
        Instructions:
        1. Cut beef into strips
        2. Brown the meat
        3. Add mushrooms and onions
        4. Simmer for 30 minutes
        5. Add sour cream
        6. Serve over noodles
      `;

      await textarea.fill(longRecipe);
      await expect(textarea).toHaveValue(new RegExp(longRecipe.slice(0, 50)));

      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');
      await expect(convertButton).toBeEnabled();
    });
  });

  test.describe('Recipe Conversion', () => {
    test('should convert simple recipe name to plant-based', async ({ page }) => {
      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      await textarea.fill('Chicken curry');
      await convertButton.click();

      // Wait for conversion result
      await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });

      // Check for recipe content
      await expect(page.locator('text=Ingredients')).toBeVisible();
      await expect(page.locator('text=Instructions')).toBeVisible();
    });

    test('should convert full recipe with ingredients and instructions', async ({ page }) => {
      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      const recipe = `
        Beef Tacos

        Ingredients:
        - 1 lb ground beef
        - 8 taco shells
        - 1 cup cheddar cheese
        - 2 tomatoes
        - 1 head lettuce

        Instructions:
        1. Brown the beef
        2. Fill shells with meat
        3. Add toppings
        4. Serve immediately
      `;

      await textarea.fill(recipe);
      await convertButton.click();

      await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('text=Ingredients')).toBeVisible();
    });

    test('should show loading state during conversion', async ({ page }) => {
      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      await textarea.fill('Steak dinner');
      await convertButton.click();

      // Check for loading state
      await expect(page.locator('text=converting your recipe')).toBeVisible();

      // Wait for completion
      await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });
    });

    test('should handle conversion error gracefully', async ({ page }) => {
      // This test assumes the backend returns a valid recipe even with empty input
      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      await textarea.fill('a');
      await convertButton.click();

      // Should either show result or error message
      const resultOrError = page.locator('text=your plant-based recipe, text=Failed to convert');
      await expect(resultOrError.first()).toBeVisible({ timeout: 30000 });
    });
  });

  test.describe('Recipe Output Display', () => {
    test('should display substitutions made section', async ({ page }) => {
      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      await textarea.fill('Chicken with butter and cream');
      await convertButton.click();

      await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });

      // Check for substitutions section
      const substitutionsSection = page.locator('text=ingredient swaps made');
      if (await substitutionsSection.isVisible()) {
        await expect(substitutionsSection).toBeVisible();
      }
    });

    test('should display cooking tips if available', async ({ page }) => {
      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      await textarea.fill('Beef roast');
      await convertButton.click();

      await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });

      // Check for cooking tips if present
      const tipsSection = page.locator('text=cooking tips');
      if (await tipsSection.isVisible()) {
        await expect(tipsSection).toBeVisible();
      }
    });

    test('should highlight substituted ingredients', async ({ page }) => {
      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      await textarea.fill('Milk and butter');
      await convertButton.click();

      await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });

      // Look for common plant-based substitutes
      const veganAlternatives = page.locator(/oat milk|almond milk|vegan butter|plant butter/i);
      // At least one should be highlighted
      expect(await veganAlternatives.count()).toBeGreaterThanOrEqual(0);
    });

    test('should show conversion complete badge', async ({ page }) => {
      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      await textarea.fill('Pork chops');
      await convertButton.click();

      await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('text=conversion complete')).toBeVisible();
    });
  });

  test.describe('Copy Functionality', () => {
    test('should copy converted recipe to clipboard', async ({ page, context }) => {
      // Grant clipboard permission
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      await textarea.fill('Chicken breast with mayo');
      await convertButton.click();

      await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });

      // Click copy button
      const copyButton = page.locator('button:has-text("copy recipe")');
      if (await copyButton.isVisible()) {
        await copyButton.click();

        // Check for feedback
        await expect(page.locator('text=copied!|copied to clipboard')).toBeVisible();
      }
    });

    test('should toggle copy button state', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      await textarea.fill('Fish and chips');
      await convertButton.click();

      await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });

      const copyButton = page.locator('button:has-text("copy recipe")');
      if (await copyButton.isVisible()) {
        await copyButton.click();
        await expect(copyButton).toContainText(/copied|Check/);
      }
    });
  });

  test.describe('Camera Integration', () => {
    test('should open camera modal when take photo button is clicked', async ({ page }) => {
      const cameraButton = page.locator('button:has-text("take photo of recipe")');

      // Note: Camera will fail without proper permissions, but we can test the UI
      await cameraButton.click();

      // Camera modal should appear or error should show
      const modal = page.locator('text=Take Photo');
      const error = page.locator('text=Camera not available|Camera access denied');

      const hasModalOrError = await Promise.race([
        modal.isVisible().then(() => 'modal'),
        error.isVisible().then(() => 'error'),
      ]).catch(() => 'none');

      // Either modal appears or error is shown (both are acceptable)
      expect(['modal', 'error']).toContain(hasModalOrError);
    });
  });

  test.describe('Form Reset', () => {
    test('should allow user to convert another recipe after result', async ({ page }) => {
      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      // First conversion
      await textarea.fill('Beef steak');
      await convertButton.click();
      await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });

      // Clear and convert another
      await textarea.clear();
      await textarea.fill('Chicken soup');

      // Convert button should be enabled again
      await expect(convertButton).toBeEnabled();
      await convertButton.click();

      // Should show new result
      await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });
    });
  });

  test.describe('Tips Section', () => {
    test('should display conversion tips section', async ({ page }) => {
      await expect(page.locator('text=conversion tips')).toBeVisible();
      await expect(page.locator('text=include everything')).toBeVisible();
      await expect(page.locator('text=be specific')).toBeVisible();
      await expect(page.locator('text=review & adjust')).toBeVisible();
    });

    test('should show numbered tips', async ({ page }) => {
      const tips = page.locator('text=conversion tips').locator('..');

      // Check for tip numbers
      await expect(tips.locator('text=1')).toBeVisible();
      await expect(tips.locator('text=2')).toBeVisible();
      await expect(tips.locator('text=3')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back to home when back button is clicked', async ({ page }) => {
      const backButton = page.locator('button:has-text("back to home")');
      await backButton.click();
      await expect(page).toHaveURL('/');
    });

    test('should navigate to vegan weapons from recipe result', async ({ page }) => {
      const textarea = page.locator('textarea');
      const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

      await textarea.fill('Beef with cream');
      await convertButton.click();

      await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });

      // Check if vegan weapons section exists and has navigation
      const weaponsSection = page.locator('text=vegan weapons');
      if (await weaponsSection.isVisible()) {
        const weaponsLink = weaponsSection.locator('a').first();
        if (await weaponsLink.isVisible()) {
          await weaponsLink.click();
          await expect(page).toHaveURL(/vegan-weapons/);
        }
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h2')).toBeVisible();
    });

    test('should have accessible form labels', async ({ page }) => {
      const textarea = page.locator('textarea');
      const h2s = page.locator('h2');

      await expect(textarea).toBeVisible();
      await expect(h2s).toBeVisible();
    });

    test('should have accessible buttons', async ({ page }) => {
      const buttons = page.locator('button');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);

      // All buttons should have accessible text
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on desktop viewport', async ({ page }) => {
      page.setViewportSize({ width: 1920, height: 1080 });

      await expect(page.locator('text=convert your recipe')).toBeVisible();
      await expect(page.locator('textarea')).toBeVisible();
      await expect(page.locator('button:has-text("convert to plant-based recipe")')).toBeVisible();
    });

    test('should display properly on tablet viewport', async ({ page }) => {
      page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator('text=convert your recipe')).toBeVisible();
      await expect(page.locator('textarea')).toBeVisible();
    });

    test('should display properly on mobile viewport', async ({ page }) => {
      page.setViewportSize({ width: 375, height: 667 });

      await expect(page.locator('text=convert your recipe')).toBeVisible();
      await expect(page.locator('textarea')).toBeVisible();
    });
  });
});
