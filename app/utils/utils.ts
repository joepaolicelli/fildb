import type { CamelCasedPropertiesDeep } from 'type-fest';
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
        // Add a selected boolean for use by components.
        .map((t) => ({ ...t, selected: false })),
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
