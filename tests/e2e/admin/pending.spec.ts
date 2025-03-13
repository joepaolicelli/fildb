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

test.describe('Pending Products', () => {
  test('should show table of pending products', async ({ page }) => {
    await supabase.from('brands').insert(
      [
        {
          id: 'e4e893b8-9197-4b11-82a9-88456a4c11f3',
          name: 'Test Brand',
        },
      ].map(objectToSnake),
    );

    await supabase.from('products').insert(
      [
        {
          id: '58b064fc-fa2a-4f58-8e62-f0170542311a',
          name: 'TestProduct1',
          brandId: 'e4e893b8-9197-4b11-82a9-88456a4c11f3',
          sources: { sources: [{ url: 'https://example.com' }] },
        },
        {
          id: '9a168708-f953-4e29-a2ea-70106e48cc66',
          name: 'TestProduct2',
          brandId: 'e4e893b8-9197-4b11-82a9-88456a4c11f3',
          sources: { sources: [{ url: 'https://example.com' }] },
        },
      ].map(objectToSnake),
    );

    await login(page, testUsers.testMaintainer1);
    await page.goto('/admin/pending');

    await expect(
      page.getByRole('cell', { name: 'TestProduct1' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'TestProduct2' }),
    ).toBeVisible();
  });
});
