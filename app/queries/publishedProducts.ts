import { defineQuery, useQuery } from '@pinia/colada';
import { objectToCamel } from 'ts-case-convert';

export const usePublishedProducts = defineQuery(() => {
  const client = useSupabaseClient();

  const page = useState<number>('productsQueryPage', () => 1);

  const { state, ...rest } = useQuery({
    key: () => ['products', page.value],
    query: async () => {
      const rangeStart = (page.value - 1) * 50;
      const resp = await client
        .from('published_products_view')
        .select()
        .order('fil_db_id', { ascending: true })
        .range(rangeStart, rangeStart + 49); // inclusive

      if (resp.error) {
        console.log(resp.error);
        throw resp.error;
      }

      return resp.data.map(objectToCamel);
    },
  });

  return {
    ...rest,
    products: state,
    page,
  };
});
