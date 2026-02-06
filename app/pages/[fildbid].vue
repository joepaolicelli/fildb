<script setup lang="ts">
import { useQuery } from '@pinia/colada';
import { objectToCamel } from 'ts-case-convert';
import { useRoute } from 'vue-router';

definePageMeta({
  validate(route) {
    return (
      typeof route.params.fildbid === 'string' &&
      /[A-Za-z]{3}-?[A-Za-z\d]-?\d{3}/.test(route.params.fildbid)
    );
  },
});

const route = useRoute();
const supabase = useSupabaseClient();

const { state: product, asyncStatus } = useQuery({
  key: ['product', route.params.fildbid ?? 'FAIL'],
  query: async () => {
    const normalizedFilDbId =
      typeof route.params.fildbid === 'string'
        ? route.params.fildbid.replaceAll('-', '').toUpperCase()
        : 'FAIL';

    const resp = await supabase
      .from('products')
      .select(
        `
        *,
        brands(*),
        filaments(*),
        tags(*),
        variants(*),
        product_group_memberships(
          product_groups(
            *
          )
        )
      `,
      )
      .eq('fil_db_id', normalizedFilDbId)
      .limit(1)
      .maybeSingle();

    if (resp.error) {
      console.log(resp.error);
      throw resp.error;
    }

    return resp.data ? objectToCamel(resp.data) : null;
  },
});
</script>
<template>
  <div class="mx-2 my-2">
    <div
      v-if="asyncStatus === 'loading'"
      class="my-5 flex flex-col items-center gap-4"
    >
      <USkeleton v-for="n of 8" :key="n" class="h-12 w-9/10" />
    </div>
    <div v-else-if="product.error">
      <UAlert
        color="error"
        variant="subtle"
        title="Query failed."
        :description="product.error.message"
        icon="solar:danger-circle-linear"
      />
    </div>
    <div v-else-if="product.data" class="font-mono">
      <div>
        <div class="text-5xl font-bold uppercase">
          <span
            v-for="(char, index) of product.data.filDbId"
            :key="index"
            :class="{
              'text-zinc-400': char === '0',
              'text-zinc-800': char !== '0',
            }"
            >{{ char }}</span
          >
        </div>
      </div>
      <div class="mt-2 grid grid-cols-1 lg:grid-cols-2">
        <div class="flex flex-col">
          <div id="productDetails">
            <div class="text-xl lg:text-2xl">
              {{ product.data.name }}
            </div>
            <div v-if="product.data.type === 'filament'">
              <FilamentDetails :product="product.data" />
            </div>
            <!-- Tags -->
            <div
              v-if="product.data.tags && product.data.tags.length > 0"
              class="mt-2"
            >
              <div class="mt-1 flex flex-wrap gap-2">
                <UBadge v-for="tag in product.data.tags" :key="tag.id">
                  {{ tag.name }}
                </UBadge>
              </div>
            </div>
            <!-- Brand -->
            <div v-if="product.data.brands" class="mt-2">
              <div class="font-semibold">
                Brand: {{ product.data.brands.name }}
              </div>
            </div>
            <!-- Notes -->
            <!-- Product Groups -->
            <div
              v-if="
                product.data.productGroupMemberships &&
                product.data.productGroupMemberships.length > 0
              "
              class="mt-2"
            >
              <div class="font-semibold">Product Groups:</div>
              <div class="mt-1 flex flex-col gap-1">
                <div
                  v-for="membership in product.data.productGroupMemberships"
                  :key="membership.productGroups.id"
                >
                  <UBadge variant="subtle">
                    {{ membership.productGroups.name }}
                  </UBadge>
                  <span
                    v-if="membership.productGroups.type"
                    class="ml-2 text-xs text-zinc-500"
                  >
                    ({{ membership.productGroups.type }})
                  </span>
                </div>
              </div>
            </div>
            <!-- Other DBs -->
            <!-- Links -->
          </div>
          <div>BUILDS</div>
        </div>
        <div class="flex flex-col">
          <div>PRICE HISTORY</div>
          <div>SWATCHES</div>
        </div>
      </div>
    </div>
    <div v-else>Not found!</div>
  </div>
</template>
