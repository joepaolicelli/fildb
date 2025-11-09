<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import { usePublishedProducts } from '~/queries/publishedProducts';
import type { Tables } from '~~/types/database.types';

// TODO pagination, product type = filament
const { products, asyncStatus } = usePublishedProducts();

// Set table columns.
const columns: TableColumn<
  CamelCasedPropertiesDeep<Tables<'published_products_view'>>
>[] = [
  {
    accessorKey: 'filDbId',
    header: 'FilDB #',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'brandId',
    header: 'Brand',
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
      <div v-else-if="products.error">
        <UAlert
          color="error"
          variant="subtle"
          title="Query failed."
          :description="products.error.message"
          icon="solar:danger-circle-linear"
        />
      </div>
      <div v-else-if="products.data">
        <div class="mt-3 flex w-full justify-end">
          <div class="text-sm">{{ products.data.length }} filaments</div>
        </div>
        <UTable :columns="columns" :data="products.data" />
      </div>
    </TableLoadingTransition>
  </div>
</template>
