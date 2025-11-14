import { defineQuery, useQuery } from '@pinia/colada';
import { objectToCamel } from 'ts-case-convert';
import { useRoute } from 'vue-router';

export const usePendingListingsByPage = defineQuery(() => {
  const client = useSupabaseClient();
  const route = useRoute();

  const { state, ...rest } = useQuery({
    key: () => ['pendingListings', route.params.pageId as string],
    query: async () => {
      // Not pagination for this query - page refers to a page of listings on a
      // site.
      let pageId = Array.isArray(route.params.pageId)
        ? route.params.pageId[0]
        : route.params.pageId;
      pageId = pageId ?? '';

      const data = [];
      let rangeStart = 0;
      do {
        const resp = await client
          .from('listings')
          .select(
            `
            *,
            skus(
              *,
              variant_skus(
                *
              )
            )
          `,
          )
          .eq('page_id', pageId)
          .is('published_at', null)
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
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...rest,
    listings: state,
  };
});
