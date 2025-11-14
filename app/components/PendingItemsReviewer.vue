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

type PendingListing = {
  listing: CamelCasedPropertiesDeep<Tables<'listings'>> & {
    skus: CamelCasedPropertiesDeep<Tables<'skus'>> & {
      variantSkus: CamelCasedPropertiesDeep<Tables<'variant_skus'>>[];
    };
  };
  form: z.infer<typeof listingFormSchema>;
  skuForm: z.infer<typeof skuFormSchema>;
};

const pendingListings: Ref<PendingListing[]> = ref([]);

watch(listings, (loadedListings) => {
  if (loadedListings.data) {
    pendingListings.value = loadedListings.data.map((l) => {
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
});

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
    accessorKey: 'listing.skus.name',
    header: 'SKU',
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
              <div class="font-bold uppercase">Variants</div>
              <VariantReviewer
                v-for="v of row.original.listing.skus.variantSkus"
                :key="v.variantId"
                :variant-id="v.variantId"
              />
            </div>
            <UCollapsible class="flex flex-col">
              <UButton
                label="Raw JSON"
                color="neutral"
                variant="outline"
                trailing-icon="i-lucide-plus"
                block
              />
              <template #content>
                <pre>{{ row.original }}</pre>
              </template>
            </UCollapsible>
          </template>
        </UTable>
      </div>
    </TableLoadingTransition>
  </div>
</template>
