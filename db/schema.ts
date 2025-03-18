import { sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';

const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
};

/* === Permissions === */
// See README for info on setting up appPermission and appRole enums, userRoles and rolePermissions tables, and related functions.

/* === Data === */
export const noteTypeEnum = pgEnum('note_type', [
  'general',
  'official_description',
]);

export const notes = pgTable(
  'notes',
  {
    id: uuid().primaryKey(),
    attachedTo: text().notNull(),
    note: text().notNull(),
    type: noteTypeEnum(),
    ...timestamps,
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert access', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_published_items'))`,
    }),
    pgPolicy('update access', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

export const brands = pgTable(
  'brands',
  {
    id: uuid().primaryKey(),
    name: text().notNull(),
    brandCodes: text()
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`), // Blank array
    ...timestamps,
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert access', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_brands'))`,
    }),
    pgPolicy('update access', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_brands'))`,
    }),
  ],
);

export const productTypeEnum = pgEnum('product_type', ['filament', 'printer']);

export const products = pgTable(
  'products',
  {
    id: uuid().primaryKey(),
    filDbId: text().unique(),
    name: text().notNull(),
    brandId: uuid()
      .notNull()
      .references(() => brands.id),
    type: productTypeEnum(),
    sources: jsonb(),
    ...timestamps,
    publishedAt: timestamp(),
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert pending items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND products.published_at IS NULL)`,
    }),
    pgPolicy('insert published items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_published_items'))`,
    }),
    pgPolicy('update pending items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`((SELECT authorize('manage_pending_items')) AND products.published_at IS NULL)`,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND products.published_at IS NULL)`,
    }),
    pgPolicy('update published items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

// Bug means this is broken right now. https://github.com/drizzle-team/drizzle-orm/issues/3332
/*export const publishedProductsView = pgView('published_products_view').as(
  (qb) => qb.select().from(products).where(isNotNull(products.publishedAt))
);*/

export const productGroupTypeEnum = pgEnum('product_group_type', [
  'product_line',
]);

export const productGroups = pgTable(
  'product_groups',
  {
    id: uuid().primaryKey(),
    name: text().notNull(),
    brandId: uuid().references(() => brands.id), // If applicable (always?)
    type: productGroupTypeEnum(),
    sources: jsonb(),
    ...timestamps,
    publishedAt: timestamp(),
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert pending items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND product_groups.published_at IS NULL)`,
    }),
    pgPolicy('insert published items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_published_items'))`,
    }),
    pgPolicy('update pending items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`((SELECT authorize('manage_pending_items')) AND product_groups.published_at IS NULL)`,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND product_groups.published_at IS NULL)`,
    }),
    pgPolicy('update published items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

export const productGroupMemberships = pgTable(
  'product_group_memberships',
  {
    productId: uuid()
      .notNull()
      .references(() => products.id),
    productGroupId: uuid()
      .notNull()
      .references(() => productGroups.id),
    ...timestamps,
    publishedAt: timestamp(),
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert pending items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND product_group_memberships.published_at IS NULL)`,
    }),
    pgPolicy('insert published items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_published_items'))`,
    }),
    pgPolicy('update pending items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`((SELECT authorize('manage_pending_items')) AND product_group_memberships.published_at IS NULL)`,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND product_group_memberships.published_at IS NULL)`,
    }),
    pgPolicy('update published items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

export const variants = pgTable(
  'variants',
  {
    id: uuid().primaryKey(),
    productId: uuid()
      .notNull()
      .references(() => products.id),
    name: text().notNull(),
    ...timestamps,
    publishedAt: timestamp(),
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert pending items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND variants.published_at IS NULL)`,
    }),
    pgPolicy('insert published items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_published_items'))`,
    }),
    pgPolicy('update pending items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`((SELECT authorize('manage_pending_items')) AND variants.published_at IS NULL)`,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND variants.published_at IS NULL)`,
    }),
    pgPolicy('update published items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

export const skus = pgTable(
  'skus',
  {
    id: uuid().primaryKey(),
    name: text().notNull(),
    shippingGrams: integer(),
    ...timestamps,
    publishedAt: timestamp(),
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert pending items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND skus.published_at IS NULL)`,
    }),
    pgPolicy('insert published items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_published_items'))`,
    }),
    pgPolicy('update pending items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`((SELECT authorize('manage_pending_items')) AND skus.published_at IS NULL)`,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND skus.published_at IS NULL)`,
    }),
    pgPolicy('update published items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

// Not different versions of a SKU, but the connections between product
// variants and skus.
export const variantSkus = pgTable(
  'variant_skus',
  {
    variantId: uuid()
      .notNull()
      .references(() => variants.id),
    skuId: uuid()
      .notNull()
      .references(() => skus.id),
    quantity: integer().notNull(),
    ...timestamps,
    publishedAt: timestamp(),
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert pending items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND variant_skus.published_at IS NULL)`,
    }),
    pgPolicy('insert published items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_published_items'))`,
    }),
    pgPolicy('update pending items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`((SELECT authorize('manage_pending_items')) AND variant_skus.published_at IS NULL)`,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND variant_skus.published_at IS NULL)`,
    }),
    pgPolicy('update published items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

export const sites = pgTable(
  'sites',
  {
    id: uuid().primaryKey(),
    name: text().notNull(),
    homepage: text(),
    ...timestamps,
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert access', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_sites'))`,
    }),
    pgPolicy('update access', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_sites'))`,
    }),
  ],
);

export const scrapers = pgTable(
  'scrapers',
  {
    id: uuid().primaryKey(),
    name: text().notNull(),
    ...timestamps,
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert access', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_scrapers'))`,
    }),
    pgPolicy('update access', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_scrapers'))`,
    }),
  ],
);

export const scrapeStatus = pgEnum('scrape_status', [
  'pending',
  'active',
  'paused',
  'archived',
]);

export const pages = pgTable(
  'pages',
  {
    id: uuid().primaryKey(),
    url: text().notNull(),
    scrapeUrl: text(),
    siteId: uuid()
      .notNull()
      .references(() => sites.id),
    scraperId: uuid().references(() => scrapers.id),
    scrapeGroup: text(),
    scrapeStatus: scrapeStatus().notNull().default('pending'),
    scraperInputs: jsonb(),
    ...timestamps,
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert access', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_pages'))`,
    }),
    pgPolicy('update access', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_pages'))`,
    }),
  ],
);

export const pageSkus = pgTable(
  'page_skus',
  {
    pageId: uuid()
      .notNull()
      .references(() => pages.id),
    skuId: uuid()
      .notNull()
      .references(() => skus.id),
    directUrl: text(),
    matchOn: jsonb(),
    ...timestamps,
    publishedAt: timestamp(),
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert access', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_published_items'))`,
    }),
    pgPolicy('update access', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

// Relations
/*export const productsRelations = relations(products, ({ many }) => ({
  packagedProducts: many(packagedProducts)
}));*/

/* === Product and Variant Types === */
export const filaments = pgTable(
  'filaments',
  {
    productId: uuid()
      .primaryKey()
      .references(() => products.id),
    material: text(),
    colorName: text(),
    colorHex: text(), // Without the "#"
    ...timestamps,
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_published_items'))`,
    }),
    pgPolicy('update items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

export const filamentVariants = pgTable(
  'filament_variants',
  {
    variantId: uuid()
      .primaryKey()
      .references(() => variants.id),
    dimension: text(), // "1.75mm", "2.85mm"
    filamentGrams: integer(),
    spoolType: text(), // "plastic", "cardboard", "none"
    isSpoolReusable: boolean(),
    spoolGrams: integer(), // Without filament
    ...timestamps,
  },
  () => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('insert items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_published_items'))`,
    }),
    pgPolicy('update items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);
