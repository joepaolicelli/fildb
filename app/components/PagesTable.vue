<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import { usePages } from '~/queries/pages';
import { useScrapers } from '~/queries/scrapers';
import { useSites } from '~/queries/sites';
import type { Tables } from '~~/types/database.types';

const { scrapers } = useScrapers();
const { sites } = useSites();
const { pages, asyncStatus } = usePages();

const siteIdToName = (id: string) => {
  let siteName = '';
  if (sites.value.data) {
    const site = sites.value.data.find((s) => s.id === id);
    siteName = site != null ? site.name : 'ERROR';
  }
  return siteName;
};
const scraperIdToName = (id: string | null) => {
  let scraperName = '';
  if (id != null && scrapers.value.data) {
    const scraper = scrapers.value.data.find((s) => s.id === id);
    scraperName = scraper != null ? scraper.name : 'ERROR';
  }
  return scraperName;
};

// Set table columns.
const columns: TableColumn<CamelCasedPropertiesDeep<Tables<'pages'>>>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'url',
    header: 'URL',
  },
  {
    accessorKey: 'scrapeUrl',
    header: 'Scrape URL',
  },
  {
    accessorKey: 'siteId',
    header: 'Site',
  },
  {
    accessorKey: 'scraperId',
    header: 'Scraper',
  },
  {
    accessorKey: 'scrapeGroup',
    header: 'Scrape Group',
  },
  {
    accessorKey: 'scrapeStatus',
    header: 'Scrape Status',
  },
];
</script>
<template>
  <div>
    <TableLoadingTransition>
      <div
        v-if="asyncStatus === 'loading'"
        class="my-5 flex flex-col items-center gap-4"
      >
        <USkeleton v-for="n of 8" :key="n" class="h-12 w-9/10" />
      </div>
      <div v-else-if="pages.error">
        <UAlert
          color="error"
          variant="subtle"
          title="Query failed."
          :description="pages.error.message"
          icon="solar:danger-circle-linear"
        />
      </div>
      <div v-else-if="pages.data">
        <div class="mt-3 flex w-full justify-end">
          <div class="text-sm">{{ pages.data.length }} pages</div>
        </div>
        <UTable :columns="columns" :data="pages.data">
          <template #siteId-cell="{ row }">
            <UTooltip
              v-if="sites.error"
              :text="`Error: ${sites.error.message}`"
            >
              <UIcon
                name="solar:danger-circle-linear"
                class="size-5 text-red-400"
              />
            </UTooltip>
            <span v-else>{{ siteIdToName(row.getValue('siteId')) }}</span>
          </template>
          <template #scraperId-cell="{ row }">
            <UTooltip
              v-if="scrapers.error"
              :text="`Error: ${scrapers.error.message}`"
            >
              <UIcon
                name="solar:danger-circle-linear"
                class="size-5 text-red-400"
              />
            </UTooltip>
            <span v-else>{{
              scraperIdToName(row.getValue('scraperId'))
            }}</span>
          </template>
        </UTable>
      </div>
    </TableLoadingTransition>
  </div>
</template>
