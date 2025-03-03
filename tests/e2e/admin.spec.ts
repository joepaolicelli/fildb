import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Setup permissions and roles in DB.
});

test.describe('Page Access', () => {
  test('should redirect to /login if not logged in', async ({ page }) => {
    await page.goto('/admin');
    // Not logged in, so redirected.
    await page.waitForURL('/login');
    expect(page.url().endsWith('/login'));
  });
});
