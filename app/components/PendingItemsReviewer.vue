<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { CamelCasedPropertiesDeep } from 'type-fest';
import { z } from 'zod';

import type { Tables } from '~~/types/database.types';
import { usePendingListingsByPage } from '~/queries/pendingListingsByPage';

const UButton = resolveComponent('UButton');

const { listings, asyncStatus } = usePendingListingsByPage();

interface ProductSource {
  url: string;
  pageId?: string;
  ts?: number;
  note?: string;
}

interface Sources {
  sources: ProductSource[];
}

const listingFormSchema = z.object({
  skuId: z.string().uuid(),
  directUrl: z.string().url(),
});
const skuFormSchema = z.object({
  name: z.string().min(1),
  shippingGrams: z.number().int(),
  variants: z.array(
    z.object({
      variantId: z.string().uuid(),
      quantity: z.number().int(),
    }),
  ),
});
const variantFormSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1),
  typeFields: z.union([
    // Filament
    z.object({
      dimension: z.enum(['1.75mm', '2.85mm']),
      filamentGrams: z.number().int(),
      spoolType: z.enum(['plastic', 'cardboard', 'none']),
      isSpoolReusable: z.boolean(),
      spoolGrams: z.number().int(),
    }),
    z.object({}),
  ]),
});
const productFormSchema = z.object({
  filDbId: z.string().length(7),
  name: z.string().min(1),
  brandId: z.string().uuid(),
  type: z.enum(['filament', 'printer']),
  // tags
  // notes
  // productGroups
  typeFields: z.union([
    // Filament
    z.object({
      material: z.string(),
      colorName: z.string(),
      colorHex: z.string().min(6).max(8),
    }),
    z.object({}),
  ]),
});

type PendingListing = {
  listing: CamelCasedPropertiesDeep<Tables<'listings'>>;
  form: z.infer<typeof listingFormSchema>;
  skuForm: z.infer<typeof skuFormSchema>;
};

const pendingListings: Ref<PendingListing[]> = ref([]);
if (listings.value.data) {
  pendingListings.value = listings.value.data.map((l) => {
    return {
      listing: l,
      form: {
        skuId: l.skuId ?? '',
        directUrl: l.directUrl ?? '',
      },
      skuForm: {
        name: l.skus.name ?? '',
        shippingGrams: l.skus.shippingGrams ?? 0,
        variants: l.skus.variantSkus,
      },
    };
  });
}

const columns: TableColumn<PendingListing>[] = [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : '',
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: 'listing.skuId',
    header: 'SKU ID',
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
      <div v-else-if="listings.error">
        <UAlert
          color="error"
          variant="subtle"
          title="Query failed."
          :description="listings.error.message"
          icon="solar:danger-circle-linear"
        />
      </div>
      <div v-else-if="listings.data">
        <div class="mt-3 flex w-full justify-end">
          <div class="text-sm">
            {{ listings.data.length }} pending listings
          </div>
        </div>
        <UTable :columns="columns" :data="pendingListings">
          <template #expanded="{ row }">
            <pre>{{ row.original }}</pre>
            <div class="m-1 rounded-lg border-2 border-slate-400 p-2">
              <div class="font-bold uppercase">Listing</div>
              <UForm
                :schema="listingFormSchema"
                :state="row.original.form"
                class="flex gap-2"
              >
                <UFormField label="SKU ID">
                  <UInput v-model="row.original.form.skuId" class="min-w-80" />
                </UFormField>
                <UFormField label="Direct URL">
                  <UInput
                    v-model="row.original.form.directUrl"
                    class="min-w-80"
                  />
                </UFormField>
                <UButton type="submit" class="h-fit self-end">Update</UButton>
              </UForm>
            </div>
            <div class="m-1 rounded-lg border-2 border-slate-400 p-2">
              <div class="font-bold uppercase">SKU</div>
              <UForm
                :schema="skuFormSchema"
                :state="row.original.skuForm"
                class="flex gap-2"
              >
                <UFormField label="Name">
                  <UInput
                    v-model="row.original.skuForm.name"
                    class="min-w-80"
                  />
                </UFormField>
                <UFormField label="Shipping Grams">
                  <UInput
                    v-model="row.original.skuForm.shippingGrams"
                    type="number"
                  />
                </UFormField>
                <!--TODO multiselect of variants to add to SKU-->
                <!--TODO list of variants in SKU, showing variant name, with quantity field and remove button-->
                <UButton type="submit" class="h-fit self-end">Update</UButton>
              </UForm>
            </div>
            <div class="m-1 rounded-lg border-2 border-slate-400 p-2">
              <div class="font-bold uppercase">Variant</div>
            </div>
            <div class="m-1 rounded-lg border-2 border-slate-400 p-2">
              <div class="font-bold uppercase">Product</div>
            </div>
          </template>
        </UTable>
      </div>
    </TableLoadingTransition>
  </div>
</template>
