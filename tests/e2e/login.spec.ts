import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Setup permissions and roles in DB.
});

test.describe('Login Form', () => {
  test('should show form elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Password' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });
});
