import { test, expect } from '@playwright/test';

import {
  addTestBrands,
  addTestPage1Listings,
  addTestSitesScrapersPages,
  createTestSupabaseClient,
  getTestUsers,
  login,
  prepDb,
} from '../util';

const supabase = await createTestSupabaseClient();
const testUsers = getTestUsers();

test.beforeAll(async () => {
  await prepDb(supabase);

  await addTestSitesScrapersPages(supabase);
  await addTestBrands(supabase);
  await addTestPage1Listings(supabase);
});

test.describe('Pending Pages Table', () => {
  test('should show site1/page1 with 3 listings', async ({ page }) => {
    await login(page, testUsers.testMaintainer1);
    await page.goto('/admin/pending');

    await expect(
      page.getByRole('cell', { name: 'https://example.com/site1/page1' }),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: '3' })).toBeVisible();
  });
});

test.describe('Pending Listings', () => {
  test('should show all listings', async ({ page }) => {
    await login(page, testUsers.testMaintainer1);
    // Site1/Page1
    await page.goto('/admin/pending/3651e6eb-6547-43a5-bd03-929b93ff4065');

    await expect(page.getByText('3 pending listings')).toBeVisible();

    await expect(
      page.getByRole('cell', { name: 'Moonlu 1kg PLA Red Spool' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Moonlu 1kg PLA Yellow Spool' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Moonlu 1kg PLA Blue Spool' }),
    ).toBeVisible();
  });
});

test.describe('Pending Listing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.testMaintainer1);
    // Site1/Page1
    await page.goto('/admin/pending/3651e6eb-6547-43a5-bd03-929b93ff4065');

    // Open details (forms).
    await page
      .getByRole('row', { name: 'Moonlu 1kg PLA Red Spool', exact: true })
      .getByRole('button')
      .click();
  });

  test('should show listing form', async ({ page }) => {
    await expect(page.getByText('Listing', { exact: true })).toBeVisible();

    await expect(page.getByRole('textbox', { name: 'SKU ID' })).toHaveValue(
      '009c66f7-7865-4482-b040-c9c634bb0f0c',
    );
    await expect(
      page.getByRole('textbox', { name: 'Direct URL' }),
    ).toBeVisible();
  });

  test('should show sku form', async ({ page }) => {
    await expect(
      page.locator('tbody').getByText('SKU', { exact: true }),
    ).toBeVisible();

    await expect(
      page.locator('tbody').getByRole('textbox', { name: 'Name' }),
    ).toHaveValue('Moonlu 1kg PLA Red Spool');
    await expect(
      page.getByRole('spinbutton', { name: 'Shipping Grams' }),
    ).toHaveValue('0');
  });

  test('should show variant form', async ({ page }) => {
    await expect(
      page.locator('tbody').getByText('Variant', { exact: true }),
    ).toBeVisible();

    await expect(
      page.locator('tbody').getByRole('textbox', { name: 'Product ID' }),
    ).toHaveValue('01282d52-922c-420d-a421-1ad7b74386d3');
    await expect(
      page
        .getByRole('form', { name: 'Variant' })
        .getByRole('textbox', { name: 'Name' }),
    ).toHaveValue('Moonlu 1kg PLA Red Spool');
  });

  test('should show variant filament form', async ({ page }) => {
    await expect(
      page.locator('tbody').getByText('Variant', { exact: true }),
    ).toBeVisible();

    await expect(page.getByRole('radio', { name: '1.75mm' })).toBeVisible();
    await expect(
      page.getByRole('spinbutton', { name: 'Filament Grams' }),
    ).toHaveValue('1000');
    await expect(page.getByRole('radio', { name: 'cardboard' })).toBeVisible();
    await expect(page.getByText('Is Spool Reusable?yesno')).toBeVisible();
    await expect(
      page.getByRole('spinbutton', { name: 'Spool Grams' }),
    ).toHaveValue('0');
  });

  test('should show product form', async ({ page }) => {
    await expect(
      page.locator('tbody').getByText('Product', { exact: true }),
    ).toBeVisible();

    await expect(
      page.locator('tbody').getByRole('textbox', { name: 'FilDB ID' }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('form', { name: 'Product' })
        .getByRole('textbox', { name: 'Name', exact: true }),
    ).toHaveValue('Moonlu PLA Red');

    await page
      .getByRole('form', { name: 'Product' })
      .getByRole('combobox', { name: 'Brand' })
      .click();
    await page.keyboard.press('ArrowDown');
    await page.getByRole('button', { name: 'Show popup' }).click();
    await expect(page.getByRole('option', { name: 'Moonlu' })).toBeVisible();
    await page.keyboard.press('Escape');

    await page
      .getByRole('form', { name: 'Product' })
      .getByRole('combobox', { name: 'Type' })
      .click();
    await expect(page.getByRole('option', { name: 'filament' })).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('should show product filament form', async ({ page }) => {
    await expect(
      page.locator('tbody').getByText('Product', { exact: true }),
    ).toBeVisible();

    await expect(
      page
        .getByRole('form', { name: 'Product Filament' })
        .getByRole('textbox', { name: 'Material' }),
    ).toHaveValue('PLA');

    await page
      .getByRole('form', { name: 'Product Filament' })
      .getByRole('combobox', { name: 'Material Class' })
      .click();
    await expect(page.getByRole('option', { name: 'PLA' })).toBeVisible();
    await page.keyboard.press('Escape');

    await expect(
      page
        .getByRole('form', { name: 'Product Filament' })
        .getByRole('textbox', { name: 'Color Name' }),
    ).toHaveValue('Red');

    await expect(
      page
        .getByRole('form', { name: 'Product Filament' })
        .getByRole('textbox', { name: 'Color Hex' }),
    ).toBeVisible();
  });

  test('should show product tags form', async ({ page }) => {
    await expect(
      page.getByRole('checkbox', { name: 'Imitates Marble' }),
    ).toBeVisible();
  });
});
