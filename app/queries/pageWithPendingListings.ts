import { defineQuery, useQuery } from '@pinia/colada';
import { objectToCamel } from 'ts-case-convert';

export const usePageWithPendingListings = defineQuery(() => {
  const client = useSupabaseClient();

  const pageId = useState<string>('pageId', () => 'null');

  const { state, ...rest } = useQuery({
    key: ['pagesWithPendingListings', pageId.value],
    query: async () => {
      const resp = await client
        .from('pages_with_pending_listings_view')
        .select()
        .eq('page_id', pageId.value)
        .maybeSingle();

      if (resp.error) {
        console.log(resp.error);
        throw resp.error;
      }

      if (resp.data == null) {
        return null;
      }

      return objectToCamel(resp.data);
    },
  });

  return {
    ...rest,
    pageId,
    pageInfo: state,
  };
});
