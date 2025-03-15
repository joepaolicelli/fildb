<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { AsyncDataRequestStatus } from '#app';
import { objectToCamel } from 'ts-case-convert';

import { useDbCacheStore } from '~/stores/dbCache';
import type { Tables } from '~~/types/database.types';

const client = useSupabaseClient();
const dbCache = useDbCacheStore();

const {
  data,
  status,
}: {
  data: Ref<{
    pages: Tables<'pages'>[];
    scrapers: Tables<'scrapers'>[];
    sites: Tables<'sites'>[];
  }>;
  status: Ref<AsyncDataRequestStatus>;
} = await useAsyncData(async () => {
  const [pages, scrapers] = await Promise.all([
    client.from('pages').select(),
    client.from('scrapers').select(),
    dbCache.loadSites(),
  ]);

  return {
    pages: pages.data != null ? pages.data.map(objectToCamel) : [],
    scrapers: scrapers.data != null ? scrapers.data.map(objectToCamel) : [],
    sites: dbCache.sites,
  };
});
const pages = data.value.pages;
const scrapers = data.value.scrapers;
const sites = data.value.sites;

// Set table columns.
const columns: TableColumn<Tables<'pages'>>[] = [
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
    cell: ({ row }) => {
      const site = sites.find((s) => s.id === row.getValue('siteId'));
      return site != null ? site.name : '';
    },
  },
  {
    accessorKey: 'scraperId',
    header: 'Scraper',
    cell: ({ row }) => {
      const scraper = scrapers.find((s) => s.id === row.getValue('scraperId'));
      return scraper != null ? scraper.name : '';
    },
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
    <div class="mt-3 flex w-full justify-end">
      <div v-if="pages != null" class="text-sm">{{ pages.length }} pages</div>
    </div>
    <UTable
      :columns="columns"
      :data="pages != null ? pages : []"
      :loading="status === 'pending'"
    />
  </div>
</template>
