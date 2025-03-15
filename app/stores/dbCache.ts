import { defineStore } from 'pinia';
import { objectToCamel } from 'ts-case-convert';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { Tables } from '~~/types/database.types';

export const useDbCacheStore = defineStore('dbCache', () => {
  const client = useSupabaseClient();

  const sites: Ref<CamelCasedPropertiesDeep<Tables<'sites'>[]>> = ref([]);
  const sitesRequested = ref(false);
  const sitesLoaded = ref(false);

  async function loadSites(force = false) {
    if (force || !sitesRequested.value) {
      sitesRequested.value = true;

      const data = [];
      let rangeStart = 0;
      do {
        const resp = await client
          .from('sites')
          .select()
          .order('created_at')
          .range(rangeStart, rangeStart + 999); // inclusive

        if (resp.data == null) {
          break;
        }
        data.push(...resp.data);

        rangeStart += 1000;
      } while (rangeStart === data.length);

      sites.value = data.map(objectToCamel);
      sitesLoaded.value = true;
    }
  }

  return { loadSites, sites, sitesRequested };
});
