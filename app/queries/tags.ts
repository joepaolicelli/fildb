import { defineQuery, useQuery } from '@pinia/colada';
import { objectToCamel } from 'ts-case-convert';

export const useTags = defineQuery(() => {
  const supabase = useSupabaseClient();

  const { state, ...rest } = useQuery({
    key: ['tags'],
    query: async () => {
      const data = [];
      let rangeStart = 0;
      do {
        const resp = await supabase
          .from('tags')
          .select(
            `
            *,
            tag_categories(*)
            `,
          )
          .order('created_at')
          .range(rangeStart, rangeStart + 999); // inclusive

        if (resp.error) {
          console.log(resp.error);
          throw resp.error;
        }

        if (resp.data == null) {
          break;
        }
        data.push(...resp.data);

        rangeStart += 1000;
      } while (rangeStart === data.length);

      return data.map(objectToCamel);
    },
  });

  return {
    ...rest,
    tags: state,
    // tagCategories will only include tag categories that have at least one
    // tag.
    tagCategories: computed(() => {
      if (state.value.data) {
        return Object.groupBy(state.value.data, ({ tagCategories }) =>
          tagCategories ? tagCategories.name : 'None',
        );
      }
      return [];
    }),
  };
});
