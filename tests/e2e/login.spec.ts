import { test, expect } from '@playwright/test';
import { objectToSnake } from 'ts-case-convert';

import { createTestSupabaseClient, getTestUsers, prepDb } from './util';

const supabase = await createTestSupabaseClient();
const testUsers = getTestUsers();

test.beforeAll(async () => {
  await prepDb(supabase);
});

test.describe('Login Form', () => {
  test('should show form elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Password' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });
});

test.describe('Login Flow', () => {
  test('should log in user and send to /admin', async ({ page }) => {
    await page.goto('/login');
    await page
      .getByRole('textbox', { name: 'Email' })
      .fill(testUsers.testMaintainer1.email);
    await page
      .getByRole('textbox', { name: 'Password' })
      .fill(testUsers.testMaintainer1.password);
    await page.getByRole('button', { name: 'Log In' }).click();

    await page.waitForURL('/admin');
    expect(page.url().endsWith('/admin'));
  });

  // test('should show error when invalid email entered', async ({ page }) => {});
  // test('should show error when valid email but invalid password entered', async ({ page }) => {});
  // test('should show error when valid email but invalid password entered', async ({ page }) => {});
});
