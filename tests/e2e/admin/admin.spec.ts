import { test, expect } from '@playwright/test';

import { createTestSupabaseClient, prepDb } from '../util';

const supabase = await createTestSupabaseClient();

test.beforeAll(async () => {
  await prepDb(supabase);
});

test.describe('Page Access', () => {
  test('should redirect to /login if not logged in', async ({ page }) => {
    await page.goto('/admin');
    // Not logged in, so redirected.
    await page.waitForURL('/login');
    expect(page.url().endsWith('/login'));
  });
});
