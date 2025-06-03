import { defineQuery, useQuery } from '@pinia/colada';
import { objectToCamel } from 'ts-case-convert';

export const useBrands = defineQuery(() => {
  const client = useSupabaseClient();

  const { state, ...rest } = useQuery({
    key: ['brands'],
    query: async () => {
      const data = [];
      let rangeStart = 0;
      do {
        const resp = await client
          .from('brands')
          .select()
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
    brands: state,
  };
});
