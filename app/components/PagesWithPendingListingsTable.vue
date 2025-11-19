<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { Tables } from '~~/types/database.types';
import { usePagesWithPendingListings } from '~/queries/pagesWithPendingListings';

const ULink = resolveComponent('ULink');

const { asyncStatus, pagesWithPendingListings } =
  usePagesWithPendingListings();

const columns: TableColumn<
  CamelCasedPropertiesDeep<Tables<'pages_with_pending_listings_view'>>
>[] = [
  {
    accessorKey: 'pendingListingsCount',
    header: 'Listings',
  },
  {
    accessorKey: 'url',
    header: 'Page',
  },
];
</script>
<template>
  <div>
    <div
      v-if="asyncStatus === 'loading'"
      class="my-5 flex flex-col items-center gap-4"
    >
      <USkeleton v-for="n of 8" :key="n" class="h-12 w-9/10" />
    </div>
    <div v-else-if="pagesWithPendingListings.error">
      <UAlert
        color="error"
        variant="subtle"
        title="Query failed."
        :description="pagesWithPendingListings.error.message"
        icon="solar:danger-circle-linear"
      />
    </div>
    <div v-else-if="pagesWithPendingListings.data">
      <UTable
        :columns="columns"
        :data="pagesWithPendingListings.data ?? []"
        class="max-w-screen"
      >
        <template #pendingListingsCount-cell="{ row }">
          <ULink :to="`/admin/pending/${row.original.pageId}`">
            {{ row.getValue('pendingListingsCount') }}
          </ULink>
        </template>
      </UTable>
    </div>
  </div>
</template>
