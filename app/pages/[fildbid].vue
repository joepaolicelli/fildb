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
  <div>
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
      <div class="font-bold uppercase">
        {{ product.data.filDbId }} {{ product.data.name }}
      </div>
      <div v-if="product.data.filaments">
        {{ product.data.filaments.material }}
        {{ product.data.filaments.colorName }}
        {{ product.data.filaments.colorHex }}
      </div>
    </div>
    <div v-else>Not found!</div>
  </div>
</template>
