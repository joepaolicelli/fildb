import { count, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  boolean,
  check,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgPolicy,
  pgTable,
  pgView,
  primaryKey,
  QueryBuilder,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';

// This QueryBuilder is needed to prevent incorrect casing in views due to a
// bug. See https://github.com/drizzle-team/drizzle-orm/issues/3332 and
// https://github.com/drizzle-team/drizzle-orm/issues/4181
const qb = new QueryBuilder({ casing: 'snake_case' });

const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
};

/* === Permissions === */
// See README for info on setting up appPermission and appRole enums, userRoles and rolePermissions tables, and related functions.

/* === Data === */
export const productTypes = ['filament', 'printer'] as const;
export const productTypeEnum = pgEnum('product_type', productTypes);

export const tagCategories = pgTable(
  'tag_categories',
  {
    id: uuid().primaryKey(),
    name: text().unique().notNull(),
    description: text(),
    productTypes: productTypeEnum()
      .array()
      .notNull()
      .default(sql`ARRAY[]::product_type[]`), // Blank array,
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

export const tags = pgTable(
  'tags',
  {
    id: uuid().primaryKey(),
    name: text().unique().notNull(),
    aliases: text()
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`), // Blank array
    description: text(),
    category: uuid().references(() => tagCategories.id),
    productTypes: productTypeEnum()
      .array()
      .notNull()
      .default(sql`ARRAY[]::product_type[]`), // Blank array,
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

export const noteTypes = ['general', 'official_description'] as const;
export const noteTypeEnum = pgEnum('note_type', noteTypes);

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
    name: text().unique().notNull(),
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
    // name should be unique if published, check when publishing
    name: text().notNull(),
    brandId: uuid()
      .notNull()
      .references(() => brands.id),
    type: productTypeEnum(),
    sources: jsonb(),
    ...timestamps,
    publishedAt: timestamp(),
  },
  (t) => [
    check(
      'fil_db_id_not_null_if_published_check',
      sql`
      (${t.publishedAt} IS NULL) OR
      (${t.filDbId} IS NOT NULL)
    `,
    ),
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

export const publishedProductsView = pgView('published_products_view')
  .with({ securityInvoker: true })
  .as(qb.select().from(products).where(isNotNull(products.publishedAt)));

export const productGroupTypes = ['product_line'] as const;
export const productGroupTypeEnum = pgEnum(
  'product_group_type',
  productGroupTypes,
);

export const productGroups = pgTable(
  'product_groups',
  {
    id: uuid().primaryKey(),
    // name should be unique if published, check when publishing
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
  (table) => [
    primaryKey({ columns: [table.productId, table.productGroupId] }),
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
    pgPolicy('delete access', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

export const productTags = pgTable(
  'product_tags',
  {
    productId: uuid()
      .notNull()
      .references(() => products.id),
    tagId: uuid()
      .notNull()
      .references(() => tags.id),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.tagId] }),
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
    pgPolicy('delete access', {
      for: 'delete',
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
    // name should be unique if published, check when publishing
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
    // name should be unique if published, check when publishing
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
  (table) => [
    primaryKey({ columns: [table.variantId, table.skuId] }),
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
    pgPolicy('delete access', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

export const sites = pgTable(
  'sites',
  {
    id: uuid().primaryKey(),
    name: text().unique().notNull(),
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
    name: text().unique().notNull(),
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

export const scrapeStatuses = [
  'pending',
  'active',
  'paused',
  'archived',
] as const;
export const scrapeStatus = pgEnum('scrape_status', scrapeStatuses);

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

export const listings = pgTable(
  'listings',
  {
    id: uuid().primaryKey(),
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

export const listingGroups = pgTable(
  'listing_groups',
  {
    id: uuid().primaryKey(),
    name: text(),
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

export const listingGroupMemberships = pgTable(
  'listing_group_memberships',
  {
    listingId: uuid()
      .notNull()
      .references(() => listings.id),
    listingGroupId: uuid()
      .notNull()
      .references(() => listingGroups.id),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.listingId, table.listingGroupId] }),
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
    pgPolicy('delete access', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

export const membershipPrograms = pgTable(
  'membership_programs',
  {
    id: uuid().primaryKey(),
    siteId: uuid().references(() => sites.id),
    name: text().notNull(),
    description: text(),
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

export const locations = pgTable(
  'locations',
  {
    id: uuid().primaryKey(),
    name: text().notNull(),
    description: text(),
    parentLocationId: uuid().references((): AnyPgColumn => locations.id),
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

export const shippingPolicyTypes = [
  'flat',
  'variable',
  'price',
  'quantity',
  'weight',
  'pickup',
  'unavailable', // explicity unavailable
] as const;
export const shippingPolicyTypeEnum = pgEnum(
  'shipping_policy_type',
  shippingPolicyTypes,
);

export const shippingPolicies = pgTable(
  'shipping_policies',
  {
    id: uuid().primaryKey(),
    siteId: uuid()
      .notNull()
      .references(() => sites.id),
    name: text().notNull(),
    sources: jsonb(),
    // location should always be set except for pickup type.
    locationId: uuid().references(() => locations.id),
    // null if no exceptions, text describing exceptions otherwise.
    locationExceptions: text(),
    type: shippingPolicyTypeEnum().notNull(),
    rate: numeric(),
    // ISO 4217 code, e.g. USD
    currency: text(),
    // null if no additional fees, text describing what they might be
    // otherwise.
    additionalFees: text(),
    // Meaning depends on the policy type:
    // - price: minimum price at which policy applies, inclusive
    // - quantity: minimum quantity at which policy applies, inclusive
    // - weight: maximum weight in grams at which policy applies, exclusive
    boundary: numeric(),
    // Shipping service (e.g. USPS, DHL, USPS Priority Mail)
    service: text(),
    estDaysMin: integer(),
    estDaysMax: integer(),
    requiredMembershipId: uuid().references(() => membershipPrograms.id),
    // Only for pickup type.
    pickupAddresses: text()
      .array()
      .default(sql`ARRAY[]::text[]`), // Blank array,
    // If siteDefault is false, then policy only applies to specific listings
    // linked to it in listing_shipping_policies.
    siteDefault: boolean().notNull().default(false),
    // start and end time should only be used if siteDefault is true. If false,
    // the start and end times in listing_shipping_policies are what applies.
    startTime: timestamp(),
    endTime: timestamp(),
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

export const listingShippingPolicies = pgTable(
  'listing_shipping_policies',
  {
    listingId: uuid()
      .notNull()
      .references(() => listings.id),
    shippingPolicyId: uuid()
      .notNull()
      .references(() => shippingPolicies.id),
    startTime: timestamp().notNull(),
    endTime: timestamp(),
    eligibleListingsGroupId: uuid().references(() => listingGroups.id),
    ...timestamps,
    publishedAt: timestamp(),
  },
  (table) => [
    primaryKey({
      columns: [table.listingId, table.shippingPolicyId, table.startTime],
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
    pgPolicy('delete access', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`(SELECT authorize('manage_published_items'))`,
    }),
  ],
);

// See https://github.com/drizzle-team/drizzle-orm/issues/2683 for why .as() is
// needed on pendingListingsCount.
export const pagesWithPendingListingsView = pgView(
  'pages_with_pending_listings_view',
)
  .with({ securityInvoker: true })
  .as(
    qb
      .select({
        pageId: listings.pageId,
        url: pages.url,
        pendingListingsCount: count(listings.skuId).as(
          'pending_listings_count',
        ),
      })
      .from(listings)
      .where(isNull(listings.publishedAt))
      .leftJoin(pages, eq(listings.pageId, pages.id))
      .groupBy(listings.pageId, pages.url),
  );

/* === Product and Variant Types === */
/* Filaments */
export const filamentMaterialClasses = pgTable(
  'filament_material_classes',
  {
    id: uuid().primaryKey(),
    name: text().unique().notNull(),
    description: text(),
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

export const filaments = pgTable(
  'filaments',
  {
    productId: uuid()
      .primaryKey()
      .references(() => products.id),
    material: text(),
    materialClass: uuid().references(() => filamentMaterialClasses.id),
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

export const filamentDimensions = ['1.75mm', '2.85mm'] as const;
export const filamentDimensionEnum = pgEnum(
  'filament_dimension',
  filamentDimensions,
);
export const filamentSpoolTypes = ['plastic', 'cardboard', 'none'] as const;
export const filamentSpoolTypeEnum = pgEnum(
  'filament_spool_type',
  filamentSpoolTypes,
);

export const filamentVariants = pgTable(
  'filament_variants',
  {
    variantId: uuid()
      .primaryKey()
      .references(() => variants.id),
    dimension: filamentDimensionEnum(),
    filamentGrams: integer(),
    spoolType: filamentSpoolTypeEnum(),
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
