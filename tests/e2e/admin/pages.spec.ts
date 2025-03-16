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

  await supabase.from('scrapers').insert(
    [
      {
        id: 'a75f8c18-213b-4045-81c2-4b546f550724',
        name: 'Test Scraper 1',
      },
    ].map(objectToSnake),
  );

  await supabase.from('pages').insert(
    [
      {
        id: '3651e6eb-6547-43a5-bd03-929b93ff4065',
        url: 'https://example.com/site1/page1',
        scrapeUrl: 'https://example.com/site1/page1/scrape',
        siteId: 'a6f684de-b326-467c-99af-7942777684ff',
        scrapeGroup: 'andromeda',
        scrapeStatus: 'pending',
      },
      {
        id: 'b9787bc9-fc73-44f6-bcf9-ebe113ae9a78',
        url: 'https://example.com/site1/page2',
        scrapeUrl: 'https://example.com/site1/page2/scrape',
        siteId: 'a6f684de-b326-467c-99af-7942777684ff',
        scrapeGroup: 'andromeda',
        scrapeStatus: 'pending',
      },
      {
        id: '7960430f-939a-4304-be4c-473642679524',
        url: 'https://example.com/site2/page1',
        siteId: '6b89d08f-3e7a-4cf5-9f21-c69d0fefdd3e',
        scrapeGroup: 'andromeda',
        scrapeStatus: 'active',
      },
    ].map(objectToSnake),
  );
});

test.describe('Pages', () => {
  test('should show table of pages', async ({ page }) => {
    await login(page, testUsers.testMaintainer1);
    await page.goto('/admin/pages');

    await expect(page.getByText('3 pages')).toBeVisible();
    await expect(
      page.getByRole('cell', {
        name: 'https://example.com/site1/page2/scrape',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Test Site 2' }),
    ).toBeVisible();
  });

  test('should add page', async ({ page }) => {
    await login(page, testUsers.testAdmin1);
    await page.goto('/admin/pages');

    await page
      .getByRole('textbox', { name: 'URL', exact: true })
      .fill('https://example.com/testpage32');
    await page
      .getByRole('textbox', { name: 'Scrape URL' })
      .fill('https://example.com/testpage32/scrape');
    await page.locator('#v-0-7-3').click();
    await page.getByRole('option', { name: 'Test Site 1' }).click();
    await page.locator('#v-0-7-4').click();
    await page.getByText('Test Scraper').click();
    await page.locator('#v-0-7-5').click();
    await page.getByRole('option', { name: 'andromeda' }).click();
    await page.getByRole('combobox', { name: 'Scrape Status' }).click();
    await page.getByRole('option', { name: 'active' }).click();

    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Created!')).toBeVisible();

    await page.goto('/admin/pages');
    await expect(page.getByText('4 pages')).toBeVisible();
    await expect(
      page.getByRole('cell', {
        name: 'https://example.com/testpage32/scrape',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Test Site 2' }),
    ).toBeVisible();
  });

  test('should fail to add page without permissions', async ({ page }) => {
    await login(page, testUsers.testRolelessUser);
    await page.goto('/admin/pages');

    await page
      .getByRole('textbox', { name: 'URL', exact: true })
      .fill('https://example.com/testpage32');
    await page
      .getByRole('textbox', { name: 'Scrape URL' })
      .fill('https://example.com/testpage32/scrape');
    await page.locator('#v-0-7-3').click();
    await page.getByRole('option', { name: 'Test Site 1' }).click();
    await page.locator('#v-0-7-4').click();
    await page.getByText('Test Scraper').click();
    await page.locator('#v-0-7-5').click();
    await page.getByRole('option', { name: 'andromeda' }).click();
    await page.getByRole('combobox', { name: 'Scrape Status' }).click();
    await page.getByRole('option', { name: 'active' }).click();

    await page.getByRole('button', { name: 'Create' }).click();

    await expect(
      page.getByText('Error: new row violates row-level security'),
    ).toBeVisible();

    await page.goto('/admin/pages');
    await expect(page.getByText('3 pages')).toBeVisible();
  });
});
