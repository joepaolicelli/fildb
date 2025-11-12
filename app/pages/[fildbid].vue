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
        filaments(*)
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
    <div v-else-if="product.data">
      <div>
        <div class="text-5xl font-bold text-zinc-400 uppercase">
          {{ product.data.filDbId }}
        </div>
        <div class="text-2xl">
          {{ product.data.name }}
        </div>
      </div>
      <div class="mt-2 grid grid-cols-1 lg:grid-cols-2">
        <div class="flex flex-col">
          <div>
            <div v-if="product.data.filaments">
              {{ product.data.filaments.material }}
              {{ product.data.filaments.colorName }}
              {{ product.data.filaments.colorHex }}
            </div>
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
