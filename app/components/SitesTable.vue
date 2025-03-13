<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { AsyncDataRequestStatus } from '#app';
import { objectToCamel } from 'ts-case-convert';

import type { Tables } from '../../types/database.types';

const client = useSupabaseClient();

// Get sites.
const {
  status,
  data: sites,
}: { data: Ref<Tables<'sites'>[]>; status: Ref<AsyncDataRequestStatus> } =
  await useAsyncData(async () => {
    const { data } = await client.from('sites').select();
    return data != null ? data.map(objectToCamel) : [];
  });

// Set table columns.
const columns: TableColumn<Tables<'sites'>>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'homepage',
    header: 'Homepage',
  },
];
</script>
<template>
  <div>
    <UTable
      :columns="columns"
      :data="sites != null ? sites : []"
      :loading="status === 'pending'"
    />
  </div>
</template>
