import { test, expect } from '@playwright/test';
import { objectToSnake } from 'ts-case-convert';

import {
  createTestSupabaseClient,
  getTestUsers,
  login,
  prepDb,
} from '../util';

const supabase = createTestSupabaseClient();
const testUsers = getTestUsers();

test.beforeEach(async () => {
  await prepDb(supabase);
});

test.describe('Sites', () => {
  test('should show table of sites', async ({ page }) => {
    await supabase.from('sites').insert(
      [
        {
          id: 'a6f684de-b326-467c-99af-7942777684ff',
          name: 'Test Site 1',
          homepage: 'https://example.com/site1',
        },
        {
          id: '6b89d08f-3e7a-4cf5-9f21-c69d0fefdd3e',
          name: 'Test Site 2',
          homepage: 'https://example.com/site2',
        },
      ].map(objectToSnake),
    );

    await login(page, testUsers.testMaintainer1);
    await page.goto('/admin/sites');

    await expect(
      page.getByRole('cell', { name: 'Test Site 1' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Test Site 2' }),
    ).toBeVisible();
  });

  test('should add site', async ({ page }) => {
    await login(page, testUsers.testAdmin1);
    await page.goto('/admin/sites');

    await page.getByRole('textbox', { name: 'Name' }).fill('My Test Site');
    await page
      .getByRole('textbox', { name: 'Homepage' })
      .fill('https://example.com/mytestsite');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Created!')).toBeVisible();

    await page.goto('/admin/sites');
    await expect(
      page.getByRole('cell', { name: 'My Test Site' }),
    ).toBeVisible();
    await expect(page.getByText('1 sites')).toBeVisible();
  });

  test("shouldn't be able to add site without permissions", async ({
    page,
  }) => {
    await login(page, testUsers.testRolelessUser);
    await page.goto('/admin/sites');

    await page.getByRole('textbox', { name: 'Name' }).fill('My Test Site');
    await page
      .getByRole('textbox', { name: 'Homepage' })
      .fill('https://example.com/mytestsite');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(
      page.getByText('Error: new row violates row-level security'),
    ).toBeVisible();

    await page.goto('/admin/sites');
    await expect(page.getByText('0 sites')).toBeVisible();
  });
});
