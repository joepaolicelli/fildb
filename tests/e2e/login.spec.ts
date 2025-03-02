import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { objectToSnake } from 'ts-case-convert';

import { getTestUsers, type TestUserInfo } from './util';

const supabase = createClient(
  process.env.TEST_SUPABASE_URL ?? '',
  process.env.TEST_SUPABASE_SECRET_KEY ?? 'placeholder'
);
const testUsers = getTestUsers();

test.beforeAll(async ({ page }) => {
  // Clear DB.
  await supabase.rpc('clear_public_schema');
  // Setup permissions and roles in DB.

  await supabase.from('role_permissions').insert([
    { role: 'admin', permission: 'manage_brands' },
    { role: 'admin', permission: 'manage_pages' },
    { role: 'admin', permission: 'manage_pending_items' },
    { role: 'admin', permission: 'manage_published_items' },
    { role: 'maintainer', permission: 'manage_pages' },
    { role: 'maintainer', permission: 'manage_pending_items' },
    { role: 'maintainer', permission: 'manage_published_items' },
  ]);
  await supabase.from('user_roles').insert(
    [
      { userId: testUsers.testAdmin1.userId, role: 'admin' },
      { userId: testUsers.testMaintainer1.userId, role: 'maintainer' },
      { userId: testUsers.testMaintainer2.userId, role: 'maintainer' },
    ].map(objectToSnake)
  );
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
