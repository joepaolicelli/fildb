import type { Page } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { objectToSnake } from 'ts-case-convert';

export async function createTestSupabaseClient() {
  const testUsers = getTestUsers();

  const supabase = createClient(
    process.env.TEST_SUPABASE_URL ?? '',
    process.env.TEST_SUPABASE_KEY ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
  await supabase.auth.signInWithPassword({
    email: testUsers.testAdmin1.email,
    password: testUsers.testAdmin1.password,
  });

  return supabase;
}

export async function prepDb(supabase: SupabaseClient) {
  // Clear DB.
  await supabase.rpc('clear_public_schema');
  await supabase.rpc('add_initial_field_values');
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

export async function addTestSitesScrapersPages(supabase: SupabaseClient) {
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
}

export async function addTestBrands(supabase: SupabaseClient) {
  await supabase.from('brands').insert(
    [
      {
        id: 'a15ca782-1b2a-4751-bea8-5e4a934736c6',
        name: 'Moonlu',
        brand_codes: ['MNL'],
      },
      {
        id: 'd6d00fdd-a588-4e71-89ef-8e842ba152b3',
        name: 'Singlemaker',
        brand_codes: [],
      },
      {
        id: '4a99b613-a0b0-447d-95b9-3466558358ab',
        name: 'eMoon',
        brand_codes: ['EMN'],
      },
    ].map(objectToSnake),
  );
}

export async function addTestPage1Listings(supabase: SupabaseClient) {
  await supabase.from('products').insert([
    {
      id: '01282d52-922c-420d-a421-1ad7b74386d3',
      fil_db_id: null,
      name: 'Moonlu PLA Red',
      brand_id: 'a15ca782-1b2a-4751-bea8-5e4a934736c6',
      type: 'filament',
      sources:
        '{"sources": [{"ts": 1763115493661, "url": "https://example.com/site1/page1", "pageId": "3651e6eb-6547-43a5-bd03-929b93ff4065"}]}',
      published_at: null,
    },
    {
      id: 'feebb1d7-ad67-43cb-ae92-74f9237e1cb0',
      fil_db_id: null,
      name: 'Moonlu PLA Yellow',
      brand_id: 'a15ca782-1b2a-4751-bea8-5e4a934736c6',
      type: 'filament',
      sources:
        '{"sources": [{"ts": 1763115493661, "url": "https://example.com/site1/page1", "pageId": "3651e6eb-6547-43a5-bd03-929b93ff4065"}]}',
      published_at: null,
    },
    {
      id: '21ba3828-94c1-4c6e-9e28-fc810d96f1e2',
      fil_db_id: null,
      name: 'Moonlu PLA Blue',
      brand_id: 'a15ca782-1b2a-4751-bea8-5e4a934736c6',
      type: 'filament',
      sources:
        '{"sources": [{"ts": 1763115493661, "url": "https://example.com/site1/page1", "pageId": "3651e6eb-6547-43a5-bd03-929b93ff4065"}]}',
      published_at: null,
    },
  ]);

  await supabase.from('variants').insert([
    {
      id: '0048f9b6-468d-416c-b78d-f9a780126d98',
      product_id: '01282d52-922c-420d-a421-1ad7b74386d3',
      name: 'Moonlu 1kg PLA Red Spool',
      published_at: null,
    },
    {
      id: '10d6d95a-ea2a-45b3-9adb-3f2677a2912d',
      product_id: 'feebb1d7-ad67-43cb-ae92-74f9237e1cb0',
      name: 'Moonlu 1kg PLA Yellow Spool',
      published_at: null,
    },
    {
      id: 'aaacfbec-ea69-4990-9e1f-2d75d496c649',
      product_id: '21ba3828-94c1-4c6e-9e28-fc810d96f1e2',
      name: 'Moonlu 1kg PLA Blue Spool',
      published_at: null,
    },
  ]);

  await supabase.from('skus').insert([
    {
      id: '009c66f7-7865-4482-b040-c9c634bb0f0c',
      name: 'Moonlu 1kg PLA Red Spool',
      shipping_grams: null,
      published_at: null,
    },
    {
      id: '014aba96-9d78-49f4-943d-886d370fe037',
      name: 'Moonlu 1kg PLA Yellow Spool',
      shipping_grams: null,
      published_at: null,
    },
    {
      id: '83ec8f62-22d6-4da2-92a5-1a6aea20eae6',
      name: 'Moonlu 1kg PLA Blue Spool',
      shipping_grams: null,
      published_at: null,
    },
  ]);

  await supabase.from('variant_skus').insert([
    {
      variant_id: '0048f9b6-468d-416c-b78d-f9a780126d98',
      sku_id: '009c66f7-7865-4482-b040-c9c634bb0f0c',
      quantity: 1,
      published_at: null,
    },
    {
      variant_id: '10d6d95a-ea2a-45b3-9adb-3f2677a2912d',
      sku_id: '014aba96-9d78-49f4-943d-886d370fe037',
      quantity: 1,
      published_at: null,
    },
    {
      variant_id: 'aaacfbec-ea69-4990-9e1f-2d75d496c649',
      sku_id: '83ec8f62-22d6-4da2-92a5-1a6aea20eae6',
      quantity: 1,
      published_at: null,
    },
  ]);

  await supabase.from('listings').insert([
    {
      id: '38944197-e4f9-4df8-b352-69d58a4cc244',
      page_id: '3651e6eb-6547-43a5-bd03-929b93ff4065',
      sku_id: '009c66f7-7865-4482-b040-c9c634bb0f0c',
      direct_url: null,
      match_on:
        '{"sku": ["listing1"], "grams": [1000], "option2": ["PLA Red"]}',
      published_at: null,
    },
    {
      id: '7833a265-ba94-483a-9d4a-417e24efbbf8',
      page_id: '3651e6eb-6547-43a5-bd03-929b93ff4065',
      sku_id: '014aba96-9d78-49f4-943d-886d370fe037',
      direct_url: null,
      match_on:
        '{"sku": ["listing2"], "grams": [1000], "option2": ["PLA Yellow"]}',
      published_at: null,
    },
    {
      id: '6f98df5d-7279-41cb-a6e1-2696da1e173e',
      page_id: '3651e6eb-6547-43a5-bd03-929b93ff4065',
      sku_id: '83ec8f62-22d6-4da2-92a5-1a6aea20eae6',
      direct_url: null,
      match_on:
        '{"sku": ["listing3"], "grams": [1000], "option2": ["PLA Blue"]}',
      published_at: null,
    },
  ]);

  const { data, error } = await supabase
    .from('filament_material_classes')
    .select('id')
    .eq('name', 'PLA')
    .limit(1)
    .single();

  const plaId = data.id;
  if (plaId == null) {
    throw new Error(`Could not find PLA material class: ${error}`);
  }

  await supabase.from('filaments').insert([
    {
      product_id: '01282d52-922c-420d-a421-1ad7b74386d3',
      material: 'PLA',
      color_name: 'Red',
      color_hex: null,
      material_class: plaId,
    },
    {
      product_id: 'feebb1d7-ad67-43cb-ae92-74f9237e1cb0',
      material: 'PLA',
      color_name: 'Yellow',
      color_hex: null,
      material_class: plaId,
    },
    {
      product_id: '21ba3828-94c1-4c6e-9e28-fc810d96f1e2',
      material: 'PLA',
      color_name: 'Blue',
      color_hex: null,
      material_class: plaId,
    },
  ]);

  await supabase.from('filament_variants').insert([
    {
      variant_id: '0048f9b6-468d-416c-b78d-f9a780126d98',
      dimension: null,
      filament_grams: 1000,
      spool_type: null,
      is_spool_reusable: null,
      spool_grams: null,
    },
    {
      variant_id: '10d6d95a-ea2a-45b3-9adb-3f2677a2912d',
      dimension: null,
      filament_grams: 1000,
      spool_type: null,
      is_spool_reusable: null,
      spool_grams: null,
    },
    {
      variant_id: 'aaacfbec-ea69-4990-9e1f-2d75d496c649',
      dimension: null,
      filament_grams: 1000,
      spool_type: null,
      is_spool_reusable: null,
      spool_grams: null,
    },
  ]);
}
