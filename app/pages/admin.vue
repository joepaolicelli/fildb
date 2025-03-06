<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { AsyncDataRequestStatus } from '#app';
import { objectToCamel } from 'ts-case-convert';

import type { Tables } from '../../types/database.types';

const ULink = resolveComponent('ULink');

const client = useSupabaseClient();
const user = useSupabaseUser();

interface ProductSource {
  url: string;
}

const { data: brands }: { data: Ref<Tables<'products'>[]> } =
  await useAsyncData(async () => {
    const { data } = await client.from('brands').select();
    return data != null ? data.map(objectToCamel) : [];
  });
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
    cell: ({ row }) => {
      const sources =
        row.getValue<{ sources: ProductSource[] }>('sources') != null
          ? row.getValue<{ sources: ProductSource[] }>('sources').sources
          : ([] as ProductSource[]);
      return h('div', ...sources.map((s) => h(ULink, { to: s.url }, s.url)));
    },
  },
];
</script>
<template>
  <div>
    <div>Admin Dashboard</div>
    <div>Logged in as {{ user?.email }}.</div>
    <UTable
      :columns="columns"
      :data="pendingProducts != null ? pendingProducts : []"
      :loading="status === 'pending'"
    />
  </div>
</template>
