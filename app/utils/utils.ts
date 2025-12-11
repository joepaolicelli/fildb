import type { CamelCasedPropertiesDeep } from 'type-fest';
import { z } from 'zod';

import type { Tables } from '~~/types/database.types';

export type ThemeColor =
  | 'error'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'neutral';

export type ScrapeStatus = 'pending' | 'active' | 'paused' | 'archived';

export const icons = {
  error: 'solar:danger-circle-linear',
  success: 'solar:check-circle-linear',
};

export const productTypesInfo = [
  {
    type: 'filament',
    letter: '0',
  },
  {
    type: 'printer',
    letter: 'p',
  },
];

// Used when certain form fields are modified.
export const modFormFieldStyles = {
  label: 'text-blue-500 font-bold',
};

export const textFormFieldEquiv = (
  trueVal: string | null,
  formVal: string,
) => {
  return trueVal === formVal || (trueVal == null && formVal === '');
};

export const enumFormFieldEquiv = (
  trueVal: string | null,
  formVal: string,
) => {
  return trueVal === formVal || (trueVal == null && formVal === '[null]');
};

export type TagWithCategory = CamelCasedPropertiesDeep<Tables<'tags'>> & {
  tagCategories: CamelCasedPropertiesDeep<Tables<'tag_categories'>> | null;
};
export type TagsWithCategories = TagWithCategory[];

export const getTagsForProductTypeByCategory = (
  tags: TagsWithCategories,
  productType: string | null,
) => {
  if (tags && productType != null) {
    const productTypeTags = tags.filter((t) =>
      (t.productTypes as string[]).includes(productType),
    );
    const result = Object.entries(
      Object.groupBy(productTypeTags, ({ tagCategories }) =>
        tagCategories ? tagCategories.name : 'None',
      ),
    ).map((tc) => ({
      categoryName: tc[0],
      tags: tc[1]
        ?.toSorted((a, b) => a.name.localeCompare(b.name))
        // Add selected and selectedCount fields for use by components.
        .map(
          (
            t,
          ): TagWithCategory & {
            selected: boolean | 'indeterminate';
            selectedCount: number;
          } => ({
            ...t,
            selected: false,
            selectedCount: 0, // Used for bulk editing.
          }),
        ),
    }));

    // Sort alphabetically by categoryName, putting 'None' last.
    result.sort((a, b) =>
      b.categoryName === 'None'
        ? -999999999
        : a.categoryName.localeCompare(b.categoryName),
    );

    return result;
  }
  return [];
};

export const listingFormSchema = z.object({
  skuId: z.string().uuid(),
  directUrl: z.string().url(),
});
export const skuFormSchema = z.object({
  name: z.string().min(1),
  shippingGrams: z.number().int(),
  variants: z.array(
    z.object({
      variantId: z.string().uuid(),
      quantity: z.number().int(),
    }),
  ),
});

export type PendingVariant = CamelCasedPropertiesDeep<Tables<'variants'>> & {
  selected: boolean;
  productSelected?: boolean;
  products: CamelCasedPropertiesDeep<Tables<'products'>>;
  filamentVariants: CamelCasedPropertiesDeep<
    Tables<'filament_variants'>
  > | null;
};
export type PendingProduct = CamelCasedPropertiesDeep<Tables<'products'>> & {
  selected: boolean;
  filaments: CamelCasedPropertiesDeep<Tables<'filaments'>> | null;
  tags: CamelCasedPropertiesDeep<Tables<'tags'>>[];
  variants: CamelCasedPropertiesDeep<Tables<'variants'>>[];
};
export type PendingListing = {
  listing: CamelCasedPropertiesDeep<Tables<'listings'>> & {
    skus: CamelCasedPropertiesDeep<Tables<'skus'>> & {
      variantSkus: CamelCasedPropertiesDeep<Tables<'variant_skus'>>[];
    };
  };
  form: z.infer<typeof listingFormSchema>;
  skuForm: z.infer<typeof skuFormSchema>;
  // For bulk edits, load variants and products here. Otherwise load them
  // individually only in VariantReviewer and ProductReviewer only when row is
  // expanded.
  variants: PendingVariant[] | null;
  products: PendingProduct[] | null;
};
