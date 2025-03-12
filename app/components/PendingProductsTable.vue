<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { AsyncDataRequestStatus } from '#app';
import { objectToCamel } from 'ts-case-convert';

import type { Tables } from '../../types/database.types';

const ULink = resolveComponent('ULink');

const client = useSupabaseClient();

interface ProductSource {
  url: string;
  pageId?: string;
  ts?: number;
  note?: string;
}

interface Sources {
  sources: ProductSource[];
}

// Get brands.
const { data: brands }: { data: Ref<Tables<'products'>[]> } =
  await useAsyncData(async () => {
    const { data } = await client.from('brands').select();
    return data != null ? data.map(objectToCamel) : [];
  });

// Get pending products.
const {
  status,
  data: pendingProducts,
}: { data: Ref<Tables<'products'>[]>; status: Ref<AsyncDataRequestStatus> } =
  await useAsyncData(async () => {
    const { data } = await client.from('products').select();
    return data != null ? data.map(objectToCamel) : [];
  });

const columns: TableColumn<Tables<'products'>>[] = [
  {
    accessorKey: 'brandId',
    header: 'Brand',
    cell: ({ row }) => {
      const brand = brands.value.find((b) => b.id === row.getValue('brandId'));
      return brand != null ? brand.name : '';
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'sources',
    header: 'Sources',
  },
];
</script>
<template>
  <div>
    <UTable
      :columns="columns"
      :data="pendingProducts != null ? pendingProducts : []"
      :loading="status === 'pending'"
    >
      <template #sources-cell="{ row }">
        <ULink
          v-for="source of (row.getValue('sources') as Sources).sources"
          :key="source.url"
          :to="source.url"
        >
          Link
        </ULink>
      </template>
    </UTable>
  </div>
</template>
