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

const {
  status,
  data,
}: {
  data: Ref<{
    brands: Tables<'brands'>[];
    pendingProducts: Tables<'products'>[];
  }>;
  status: Ref<AsyncDataRequestStatus>;
} = await useAsyncData(async () => {
  const [brands, pendingProducts] = await Promise.all([
    client.from('brands').select(),
    client.from('products').select(),
  ]);

  return {
    brands: brands.data != null ? brands.data.map(objectToCamel) : [],
    pendingProducts:
      pendingProducts.data != null
        ? pendingProducts.data.map(objectToCamel)
        : [],
  };
});
const brands = data.value.brands;
const pendingProducts = data.value.pendingProducts;

const columns: TableColumn<Tables<'products'>>[] = [
  {
    accessorKey: 'brandId',
    header: 'Brand',
    cell: ({ row }) => {
      const brand = brands.find((b) => b.id === row.getValue('brandId'));
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
      :data="pendingProducts ?? []"
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
