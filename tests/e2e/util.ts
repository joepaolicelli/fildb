import type { Page } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { objectToSnake } from 'ts-case-convert';

export function createTestSupabaseClient() {
  return createClient(
    process.env.TEST_SUPABASE_URL ?? '',
    process.env.TEST_SUPABASE_SECRET_KEY ?? 'placeholder',
  );
}

export async function prepDb(supabase: SupabaseClient) {
  // Clear DB.
  await supabase.rpc('clear_public_schema');

  // Setup permissions and roles in DB.
  const testUsers = getTestUsers();
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
    ].map(objectToSnake),
  );
}

export type TestUserInfo = {
  email: string;
  password: string;
  userId: string;
};

export async function login(page: Page, user: TestUserInfo) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(user.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(user.password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL('/admin');
}

export function getTestUsers() {
  return {
    testAdmin1: {
      email: 'testadmin1@example.com',
      password: process.env.TEST_ADMIN_1_PW,
      userId: '50e97329-53b7-4834-b1f6-4b5ee7d2a091',
    },
    testMaintainer1: {
      email: 'testmaintainer1@example.com',
      password: process.env.TEST_MAINTAINER_1_PW,
      userId: '8ebdb5dd-88f0-4985-ab2f-0241c41c8498',
    },
    testMaintainer2: {
      email: 'testmaintainer2@example.com',
      password: process.env.TEST_MAINTAINER_2_PW,
      userId: 'b2c966ec-3969-449e-8371-65e46edf4557',
    },
    testRolelessUser: {
      email: 'testrolelessuser@example.com',
      password: process.env.TEST_ROLELESS_USER_PW,
      userId: 'a70f7a73-17e1-48bf-a028-a755a5cb804e',
    },
  } as {
    testAdmin1: TestUserInfo;
    testMaintainer1: TestUserInfo;
    testMaintainer2: TestUserInfo;
    testRolelessUser: TestUserInfo;
  };
}
