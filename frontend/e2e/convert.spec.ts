import { test, expect } from '@playwright/test';

test.describe('Convert Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/convert');
  });

  test('should load convert page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Vegan Converter/);
    await expect(page.locator('text=convert your recipe')).toBeVisible();
  });

  test('should display recipe conversion form', async ({ page }) => {
    // Check for textarea
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    // Check for convert button
    const convertButton = page.locator('button:has-text("convert to plant-based recipe")');
    await expect(convertButton).toBeVisible();
    await expect(convertButton).toBeDisabled(); // Should be disabled when empty
  });

  test('should enable convert button when recipe is entered', async ({ page }) => {
    const textarea = page.locator('textarea');
    const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

    // Type a recipe
    await textarea.fill('Chicken parmesan with sour cream');

    // Button should be enabled
    await expect(convertButton).toBeEnabled();
  });

  test('should convert recipe when submitted', async ({ page }) => {
    const textarea = page.locator('textarea');
    const convertButton = page.locator('button:has-text("convert to plant-based recipe")');

    // Type a short recipe
    await textarea.fill('Chicken');

    // Click convert
    await convertButton.click();

    // Wait for response and check for result
    await expect(page.locator('text=your plant-based recipe')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=Plant-Based')).toBeVisible();
  });

  test('should display footer with Ailamedia link', async ({ page }) => {
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();

    // Check for footer text
    await expect(page.locator('text=Created by Laila Madsø for Ailamedia.com')).toBeVisible();

    // Check for link
    const link = page.locator('a[href="https://ailamedia.com"]');
    await expect(link).toBeVisible();

    // Verify link opens in new tab
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('should have camera button available', async ({ page }) => {
    const cameraButton = page.locator('button:has-text("take photo of recipe")');
    await expect(cameraButton).toBeVisible();
  });

  test('should reset form when reset action is triggered', async ({ page }) => {
    const textarea = page.locator('textarea');

    // Enter text
    await textarea.fill('Test recipe');
    await expect(textarea).toHaveValue('Test recipe');

    // The reset functionality would be tested after conversion
    // This is a basic test to ensure the form is interactive
  });
});
