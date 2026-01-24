<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import _ from 'lodash';
import { objectToCamel } from 'ts-case-convert';
import type { CamelCasedPropertiesDeep } from 'type-fest';
import { useRoute } from 'vue-router';
import { z } from 'zod';

import type { Tables } from '~~/types/database.types';
import { usePageWithPendingListings } from '~/queries/pageWithPendingListings';
import { usePendingListingsByPage } from '~/queries/pendingListingsByPage';

const UButton = resolveComponent('UButton');

const route = useRoute();
const supabase = useSupabaseClient();

const { pageInfo, pageId } = usePageWithPendingListings();
pageId.value = route.params.pageId as string;

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

const bulkTabs = [
  {
    label: 'SKUs',
    value: 'skus',
    icon: 'material-symbols:shopping-cart-outline',
    slot: 'bulkSkus',
  },
  {
    label: 'Variants',
    value: 'variants',
    icon: 'icon-park-outline:ad-product',
    slot: 'bulkVariants',
  },
  {
    label: 'Products',
    value: 'products',
    icon: 'material-symbols:circle-outline',
    slot: 'bulkProducts',
  },
];

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
        variants: null,
        products: null,
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
  {
    accessorKey: 'variants',
    header: 'Variants & Products',
  },
];

const pendingVariants: Ref<PendingVariant[]> = ref([]);
const pendingProducts: Ref<PendingProduct[]> = ref([]);

const loadAllItems = async () => {
  if (listings.value.data) {
    // Get variants.
    const variantsResp = await supabase
      .from('variants')
      .select(
        `
        *,
        products(*),
        filament_variants(*)
        `,
      )
      .in(
        'id',
        listings.value.data
          .map((l) => l.skus.variantSkus.map((vs) => vs.variantId))
          .flat(),
      );

    if (variantsResp.error) {
      console.log(variantsResp.error);
      throw variantsResp.error;
    }

    pendingVariants.value = _.uniqBy(
      objectToCamel(variantsResp.data).map((v) => ({
        ...v,
        selected:
          pendingVariants.value.length === 0
            ? true
            : (pendingVariants.value.find((pv) => pv.id === v.id)?.selected ??
              false),
      })),
      'id',
    );

    // Get products.
    const productsResp = await supabase
      .from('products')
      .select(
        `
        *,
        filaments(*),
        tags(*),
        variants(*)
        `,
      )
      .in(
        'id',
        pendingVariants.value.map((v) => v.products.id),
      );

    if (productsResp.error) {
      console.log(productsResp.error);
      throw productsResp.error;
    }

    pendingProducts.value = _.uniqBy(
      objectToCamel(productsResp.data).map((p) => ({
        ...p,
        selected:
          pendingProducts.value.length === 0
            ? true
            : (pendingProducts.value.find((pp) => pp.id === p.id)?.selected ??
              false),
      })),
      'id',
    );

    for (const pl of pendingListings.value) {
      pl.variants = pendingVariants.value
        .filter((v) =>
          pl.listing.skus.variantSkus.map((vs) => vs.variantId).includes(v.id),
        )
        .map((v) => ({
          ...v,
          selected:
            pendingVariants.value.find((pv) => pv.id === v.id)?.selected ??
            false,
          productSelected:
            pendingProducts.value.find((pp) => pp.id === v.productId)
              ?.selected ?? false,
        }));
    }
  }
};
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
        <div v-if="pageInfo.data">
          Page:
          <ULink :to="pageInfo.data.url ?? '#'">{{ pageInfo.data.url }}</ULink>
        </div>
        <div class="mt-3 flex w-full justify-end">
          <div class="text-sm">
            {{ listings.data.length }} pending listings
          </div>
        </div>
        <div class="m-1 max-w-screen rounded-lg border-2 border-slate-400 p-2">
          <div class="flex justify-between">
            <div class="font-bold uppercase">Bulk Editing</div>
            <UButton label="Load All Items" @click="loadAllItems" />
          </div>
          <div v-if="pendingVariants.length > 0" class="my-2">
            <UTabs :items="bulkTabs" default-value="products">
              <template #bulkProducts>
                <BulkProductEditor
                  :products="pendingProducts"
                  @refetch-all="loadAllItems()"
                  @select-all="
                    () => {
                      for (const pp of pendingProducts) {
                        pp.selected = true;
                      }
                      for (const pl of pendingListings) {
                        for (const v of pl.variants ?? []) {
                          v.productSelected = true;
                        }
                      }
                    }
                  "
                  @clear-all="
                    () => {
                      for (const pp of pendingProducts) {
                        pp.selected = false;
                      }
                      for (const pl of pendingListings) {
                        for (const v of pl.variants ?? []) {
                          v.productSelected = false;
                        }
                      }
                    }
                  "
                />
              </template>
            </UTabs>
          </div>
        </div>
        <UTable :columns="columns" :data="pendingListings">
          <template #variants-cell="{ row }">
            <div v-if="row.original.variants">
              <div
                v-for="variant in row.original.variants"
                :key="variant.id"
                class="grid-columns-2 grid grid-flow-col gap-1"
              >
                <UCheckbox
                  v-model="variant.selected"
                  :label="variant.name"
                  variant="card"
                  class="rounded-none"
                  :class="{ 'bg-slate-200': variant.publishedAt != null }"
                  @update:model-value="
                    (selected) => {
                      const pv = pendingVariants.find(
                        (v) => v.id === variant.id,
                      );
                      if (pv && typeof selected === 'boolean') {
                        pv.selected = selected;
                      }
                    }
                  "
                />
                <UCheckbox
                  v-model="variant.productSelected"
                  :label="variant.products.name"
                  variant="card"
                  class="rounded-none"
                  :class="{
                    'bg-slate-200': variant.products.publishedAt != null,
                  }"
                  @update:model-value="
                    (selected) => {
                      const pp = pendingProducts.find(
                        (p) => p.id === variant.products.id,
                      );
                      if (pp && typeof selected === 'boolean') {
                        pp.selected = selected;
                      }
                    }
                  "
                />
              </div>
            </div>
          </template>
          <template #expanded="{ row }">
            <div class="max-w-screen">
              <div class="flex justify-between gap-1">
                <div class="grow">
                  <div class="m-1 rounded-lg border-2 border-slate-400 p-2">
                    <div id="listingFormLabel" class="font-bold uppercase">
                      Listing
                    </div>
                    <UForm
                      aria-labelledby="listingFormLabel"
                      :schema="listingFormSchema"
                      :state="row.original.form"
                      class="flex gap-2"
                    >
                      <UFormField label="SKU ID">
                        <UInput
                          v-model="row.original.form.skuId"
                          class="min-w-80"
                        />
                      </UFormField>
                      <UFormField label="Direct URL">
                        <UInput
                          v-model="row.original.form.directUrl"
                          class="min-w-80"
                        />
                      </UFormField>
                      <UButton type="submit" class="h-fit self-end"
                        >Update</UButton
                      >
                    </UForm>
                  </div>
                  <div class="m-1 rounded-lg border-2 border-slate-400 p-2">
                    <div id="skuFormLabel" class="font-bold uppercase">
                      SKU
                    </div>
                    <UForm
                      aria-labelledby="skuFormLabel"
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
                      <UButton type="submit" class="h-fit self-end"
                        >Update</UButton
                      >
                    </UForm>
                  </div>
                </div>
                <div
                  class="m-1 rounded-lg border-1 border-slate-400 p-1 text-xs"
                >
                  <pre>{{ row.original.listing.matchOn }}</pre>
                </div>
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
            </div>
          </template>
        </UTable>
      </div>
    </TableLoadingTransition>
  </div>
</template>
