<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { Tables } from '../../types/database.types';

const client = useSupabaseClient();
const user = useSupabaseUser();

const columns: TableColumn<Tables<'products'>>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
];

const { status, data: pendingProducts } = await useAsyncData(async () => {
  const { data } = await client.from('products').select();
  return data;
});
</script>
<template>
  <div>
    <div>Logged in as {{ user?.email }}.</div>
    <UTable
      :columns="columns"
      :data="pendingProducts != null ? pendingProducts : []"
      :loading="status === 'pending'"
    />
  </div>
</template>
