import { defineQuery, useQuery } from '@pinia/colada';
import { objectToCamel } from 'ts-case-convert';
import { useRoute } from 'vue-router';

export const usePendingListingsByPage = defineQuery(() => {
  const client = useSupabaseClient();
  const route = useRoute();

  let pageId = Array.isArray(route.params.pageId)
    ? route.params.pageId[0]
    : route.params.pageId;
  pageId = pageId ?? '';

  const { state, ...rest } = useQuery({
    key: ['pendingListings', pageId],
    query: async () => {
      const data = [];
      let rangeStart = 0;
      do {
        const resp = await client
          .from('listings')
          .select(
            `
            id,
            page_id,
            sku_id,
            direct_url,
            match_on,
            created_at,
            updated_at,
            published_at,
            skus(
              id,
              name,
              shipping_grams,
              created_at,
              updated_at,
              published_at,
              variant_skus(
                variant_id,
                quantity
              )
            )
          `,
          )
          .eq('page_id', pageId)
          .is('published_at', null)
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
    listings: state,
  };
});
