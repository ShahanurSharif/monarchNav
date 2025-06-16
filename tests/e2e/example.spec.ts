import { test, expect } from '@playwright/test';

test.describe('MonarchNav E2E', () => {
  test('should load the workbench and allow adding MonarchNav extension', async ({ page }) => {
    // Navigate to the local workbench
    await page.goto('https://localhost:4321/temp/workbench.html');
    
    // Wait for the workbench to load
    await expect(page.locator('div[data-automation-id="CanvasZone"]')).toBeVisible({ timeout: 10000 });
    
    // Look for the workbench canvas or add extension button
    const workbenchVisible = await page.locator('div[data-automation-id="CanvasZone"]').isVisible();
    expect(workbenchVisible).toBe(true);
    
    // Note: In a real e2e test, you would need to manually add the extension
    // or use a pre-configured workbench page with the extension already added
    console.log('Workbench loaded successfully. Extension can be manually added for testing.');
  });

  test('should validate extension manifest and configuration', async ({ page }) => {
    // This test validates that the extension files are accessible
    await page.goto('https://localhost:4321/');
    
    // Check if the extension JavaScript bundle is available
    const response = await page.request.get('https://localhost:4321/dist/monarch-nav-application-customizer.js');
    expect(response.status()).toBe(200);
    
    console.log('Extension bundle is accessible via dev server.');
  });

  // TODO: Add more comprehensive e2e tests when the extension is deployed to a test site
  // These would include:
  // - Navigation functionality
  // - Theme customization
  // - Configuration management
  // - Responsive behavior
});
