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
// Based on https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac?queryGroups=language&language=plpgsql#create-a-table-to-track-user-roles-and-permissions
/*export const appPermission = pgEnum('app_permission', [
  'manage_brands',
  'manage_pages',
  'manage_pending_items',
  'manage_published_items',
]);

export const appRole = pgEnum('app_role', ['admin', 'maintainer']);

export const userRoles = pgTable(
  'user_roles',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid()
      .references(() => authUsers.id, { onDelete: 'cascade' })
      .notNull(),
    role: appRole().notNull(),
  },
  (t) => [
    unique().on(t.userId, t.role),
    pgPolicy('user can read own roles', {
      for: 'select',
      to: authenticatedRole,
      using: sql`(select auth.uid()) = user_id`,
    }),
  ]
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: uuid().defaultRandom().primaryKey(),
    role: appRole().notNull(),
    permission: appPermission().notNull(),
  },
  (t) => [unique().on(t.role, t.permission)]
);*/

/* === Data === */
export const noteTypeEnum = pgEnum('note_type', [
  'general',
  'official_description',
]);

export const notes = pgTable('notes', {
  id: uuid().primaryKey(),
  attachedTo: text().notNull(),
  note: text().notNull(),
  type: noteTypeEnum(),
  ...timestamps,
});

export const brands = pgTable('brands', {
  id: uuid().primaryKey(),
  name: text().notNull(),
  brandCodes: text()
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`), // Blank array
  ...timestamps,
});

export const products = pgTable(
  'products',
  {
    id: uuid().primaryKey(),
    filDbId: text().unique(),
    name: text().notNull(),
    brandId: uuid()
      .notNull()
      .references(() => brands.id),
    ...timestamps,
    publishedAt: timestamp(),
  },
  (_t) => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
    pgPolicy('update access', {
      for: 'update',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_pending_items'))`,
    }),
  ]
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
  (_t) => [
    pgPolicy('read for all', {
      for: 'select',
      to: 'public',
      using: sql`true`,
    }),
  ]
);

export const saleUnits = pgTable('sale_units', {
  id: uuid().primaryKey(),
  name: text().notNull(),
  shippingWeight: integer(), // In grams
  ...timestamps,
  publishedAt: timestamp(),
});

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
  ]
);

export const sites = pgTable('sites', {
  id: uuid().primaryKey(),
  name: text().notNull(),
  ...timestamps,
});

export const scrapers = pgTable('scrapers', {
  id: uuid().primaryKey(),
  name: text().notNull(),
  ...timestamps,
});

export const pages = pgTable('pages', {
  id: uuid().primaryKey(),
  url: text().notNull(),
  scrapeUrl: text(),
  siteId: uuid().references(() => sites.id),
  scraperId: uuid().references(() => scrapers.id),
  scraperInputs: jsonb(),
  ...timestamps,
});

export const pageSaleUnits = pgTable('page_sale_units', {
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
});

// Relations
/*export const productsRelations = relations(products, ({ many }) => ({
  packagedProducts: many(packagedProducts)
}));*/
