<script setup lang="ts">
import { useQuery } from '@pinia/colada';
import { objectToCamel } from 'ts-case-convert';
import type { Reactive } from 'vue';
import { z } from 'zod';

import { productTypes } from '~~/db/schema';

const props = defineProps<{
  productId: string;
}>();

const client = useSupabaseClient();

interface ProductSource {
  url: string;
  pageId?: string;
  ts?: number;
  note?: string;
}

interface Sources {
  sources: ProductSource[];
}

const productFormSchema = z.object({
  filDbId: z.string().length(7),
  name: z.string().min(1),
  brandId: z.string().uuid(),
  type: z.enum(['[null]', ...productTypes]),
  // tags
  // notes
  // productGroups
});

const filamentFormSchema = z.object({
  material: z.string(),
  colorName: z.string(),
  colorHex: z.string().min(6).max(8),
});

const form: Reactive<z.infer<typeof productFormSchema>> = reactive({
  filDbId: '',
  name: '',
  brandId: '',
  type: '[null]',
});
const filamentTypeForm: Reactive<z.infer<typeof filamentFormSchema>> =
  reactive({
    material: '',
    colorName: '',
    colorHex: '',
  });

const { state: product, asyncStatus } = useQuery({
  key: ['product', props.productId],
  query: async () => {
    // Lots of potential improvements. Postgres function? Buffering and/or
    // batching layer? Use Supabase realtime functionality?
    const resp = await client
      .from('products')
      .select(
        `
          *,
          filaments(*)
        `,
      )
      .eq('id', props.productId)
      .limit(1)
      .single();

    if (resp.error) {
      console.log(resp.error);
      throw resp.error;
    }

    return objectToCamel(resp.data);
  },
});

watch(
  () => product.value,
  () => {
    if (product.value.data) {
      const v = product.value.data;

      form.filDbId = v.filDbId ?? '';
      form.name = v.name;
      form.brandId = v.brandId;
      form.type = v.type ?? '[null]';

      if (v.filaments) {
        filamentTypeForm.material = v.filaments.material ?? '';
        filamentTypeForm.colorName = v.filaments.colorName ?? '';
        filamentTypeForm.colorHex = v.filaments.colorHex ?? '';
      }
    }
  },
  { immediate: true },
);

const typeOptions = ref(['[null]', ...productTypes]);
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
    <div
      v-else-if="product.data"
      class="m-1 rounded-lg border-2 border-slate-400 p-2"
    >
      <div class="font-bold uppercase">Product</div>
      <UForm
        :schema="productFormSchema"
        :state="form"
        class="flex flex-wrap gap-2"
      >
        <UFormField label="FilDB #">
          <UInput v-model="form.filDbId" class="min-w-20" />
        </UFormField>
        <UFormField label="Name">
          <UInput v-model="form.name" class="min-w-80" />
        </UFormField>
        <UFormField label="Brand ID">
          <UInput v-model="form.brandId" class="min-w-80" />
        </UFormField>
        <UFormField label="Type">
          <USelect v-model="form.type" :items="typeOptions" class="min-w-40" />
        </UFormField>
        <UButton type="submit" class="h-fit self-end">Update</UButton>
      </UForm>
      <USeparator class="my-2" />
      <UForm
        v-if="product.data.type === 'filament'"
        :schema="filamentFormSchema"
        :state="filamentTypeForm"
        class="flex flex-wrap gap-x-4 gap-y-3"
      >
        <UFormField label="Material">
          <UInput v-model="filamentTypeForm.material" class="min-w-40" />
        </UFormField>
        <UFormField label="Color Name">
          <UInput v-model="filamentTypeForm.colorName" class="min-w-40" />
        </UFormField>
        <UFormField label="Color Hex" hint="No #">
          <UInput v-model="filamentTypeForm.colorHex" class="min-w-20" />
        </UFormField>
        <UButton type="submit" class="h-fit self-end">Update</UButton>
      </UForm>
    </div>
  </div>
</template>
