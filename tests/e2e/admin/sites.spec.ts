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

test.beforeAll(async () => {
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
});
