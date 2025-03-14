import { getTableColumns, isNotNull, relations, sql } from 'drizzle-orm';
import {
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { authenticatedRole, authUsers } from 'drizzle-orm/supabase';

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

export const products = pgTable(
  'products',
  {
    id: uuid().primaryKey(),
    filDbId: text().unique(),
    name: text().notNull(),
    brandId: uuid()
      .notNull()
      .references(() => brands.id),
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

export const packagedProducts = pgTable(
  'packaged_products',
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
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND packaged_products.published_at IS NULL)`,
    }),
    pgPolicy('insert published items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_published_items'))`,
    }),
    pgPolicy('update pending items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`((SELECT authorize('manage_pending_items')) AND packaged_products.published_at IS NULL)`,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND packaged_products.published_at IS NULL)`,
    }),
    pgPolicy('update published items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

export const saleUnits = pgTable(
  'sale_units',
  {
    id: uuid().primaryKey(),
    name: text().notNull(),
    shippingWeight: integer(), // In grams
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
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND sale_units.published_at IS NULL)`,
    }),
    pgPolicy('insert published items', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`(SELECT authorize('manage_published_items'))`,
    }),
    pgPolicy('update pending items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`((SELECT authorize('manage_pending_items')) AND sale_units.published_at IS NULL)`,
      withCheck: sql`((SELECT authorize('manage_pending_items')) AND sale_units.published_at IS NULL)`,
    }),
    pgPolicy('update published items', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

export const saleUnitPackagedProducts = pgTable(
  'sale_unit_packaged_products',
  {
    saleUnitId: uuid()
      .notNull()
      .references(() => saleUnits.id),
    packagedProductId: uuid().notNull(),
    quantity: integer().notNull(),
    ...timestamps,
    publishedAt: timestamp(),
  },
  (table) => [
    // Explicity set fk here to avoid name being truncated for length.
    foreignKey({
      columns: [table.packagedProductId],
      foreignColumns: [packagedProducts.id],
      name: 'sale_unit_packaged_products_id_fk',
    }),
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

export const pageSaleUnits = pgTable(
  'page_sale_units',
  {
    pageId: uuid()
      .notNull()
      .references(() => pages.id),
    saleUnitId: uuid()
      .notNull()
      .references(() => saleUnits.id),
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
