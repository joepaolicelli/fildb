<script setup lang="ts">
import { useQuery } from '@pinia/colada';
import { objectToCamel } from 'ts-case-convert';
import type { Reactive } from 'vue';
import { z } from 'zod';

import { filamentDimensions, filamentSpoolTypes } from '~~/db/schema';

const UButton = resolveComponent('UButton');

const props = defineProps<{
  variantId: string;
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

const variantFormSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1),
});

const filamentVariantFormSchema = z.object({
  dimension: z.enum([...filamentDimensions]).nullable(),
  filamentGrams: z.number().int(),
  spoolType: z.enum([...filamentSpoolTypes]).nullable(),
  //isSpoolReusable: z.boolean().nullable(),
  isSpoolReusable: z.enum(['yes', 'no']).nullable(),
  spoolGrams: z.number().int(),
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

const { state: variant, asyncStatus } = useQuery({
  key: ['variant', props.variantId],
  query: async () => {
    // Lots of potential improvements. Postgres function? Buffering and/or
    // batching layer? Use Supabase realtime functionality?
    const resp = await client
      .from('variants')
      .select(
        `
          *,
          products(
            *,
            variants(*)
          ),
          filament_variants(*)
        `,
      )
      .eq('id', props.variantId)
      .limit(1)
      .single();

    if (resp.error) {
      console.log(resp.error);
      throw resp.error;
    }

    return objectToCamel(resp.data);
  },
});

const form: Reactive<z.infer<typeof variantFormSchema>> = reactive({
  productId: '',
  name: '',
});
const filamentTypeForm: Reactive<z.infer<typeof filamentVariantFormSchema>> =
  reactive({
    dimension: null,
    filamentGrams: 0,
    spoolType: null,
    isSpoolReusable: null,
    spoolGrams: 0,
  });

const dimensionOptions = ref([...filamentDimensions]);
const spoolTypeOptions = ref([...filamentSpoolTypes]);
const isSpoolReusableOptions = ref(['yes', 'no']);

if (variant.value.data) {
  const v = variant.value.data;

  form.productId = v.productId;
  form.name = v.name;

  if (v.filamentVariants) {
    filamentTypeForm.dimension = v.filamentVariants.dimension ?? null;
    filamentTypeForm.filamentGrams = v.filamentVariants.filamentGrams ?? 0;
    filamentTypeForm.spoolType = v.filamentVariants.spoolType ?? null;
    filamentTypeForm.spoolGrams = v.filamentVariants.spoolGrams ?? 0;

    switch (v.filamentVariants.isSpoolReusable) {
      case true:
        filamentTypeForm.isSpoolReusable = 'yes';
        break;
      case false:
        filamentTypeForm.isSpoolReusable = 'no';
        break;
      case null:
        filamentTypeForm.isSpoolReusable = null;
    }
  }
}
</script>
<template>
  <div>
    <div
      v-if="asyncStatus === 'loading'"
      class="my-5 flex flex-col items-center gap-4"
    >
      <USkeleton v-for="n of 8" :key="n" class="h-12 w-9/10" />
    </div>
    <div v-else-if="variant.error">
      <UAlert
        color="error"
        variant="subtle"
        title="Query failed."
        :description="variant.error.message"
        icon="solar:danger-circle-linear"
      />
    </div>
    <div
      v-else-if="variant.data"
      class="m-1 rounded-lg border-2 border-slate-400 p-2"
    >
      <div class="font-bold uppercase">Variant</div>
      <UForm :schema="variantFormSchema" :state="form" class="flex gap-2">
        <UFormField label="Product ID">
          <UInput v-model="form.productId" class="min-w-80" />
        </UFormField>
        <UFormField label="Name">
          <UInput v-model="form.name" class="min-w-80" />
        </UFormField>
        <UButton type="submit" class="h-fit self-end">Update</UButton>
      </UForm>
      <USeparator class="my-2" />
      <UForm
        v-if="variant.data.products.type === 'filament'"
        :schema="filamentVariantFormSchema"
        :state="filamentTypeForm"
        class="flex flex-wrap gap-x-4 gap-y-3"
      >
        <div class="flex flex-row">
          <UFormField label="Dimension" class="self-end">
            <URadioGroup
              v-model="filamentTypeForm.dimension"
              :items="dimensionOptions"
              orientation="horizontal"
              class=""
            />
          </UFormField>
          <UButton
            icon="solar:eraser-linear"
            variant="outline"
            class="h-fit self-end"
            @click="filamentTypeForm.dimension = null"
          />
        </div>
        <UFormField label="Filament Grams" hint="0 = null">
          <UInput
            v-model="filamentTypeForm.filamentGrams"
            type="number"
            class=""
          />
        </UFormField>
        <div class="flex flex-row">
          <UFormField label="Spool Type" class="self-end">
            <URadioGroup
              v-model="filamentTypeForm.spoolType"
              :items="spoolTypeOptions"
              orientation="horizontal"
              class=""
            />
          </UFormField>
          <UButton
            icon="solar:eraser-linear"
            variant="outline"
            class="h-fit self-end"
            @click="filamentTypeForm.spoolType = null"
          />
        </div>
        <div class="flex flex-row">
          <UFormField label="Is Spool Reusable?" class="self-end">
            <URadioGroup
              v-model="filamentTypeForm.isSpoolReusable"
              :items="isSpoolReusableOptions"
              orientation="horizontal"
              class=""
            />
          </UFormField>
          <UButton
            icon="solar:eraser-linear"
            variant="outline"
            class="h-fit self-end"
            @click="filamentTypeForm.isSpoolReusable = null"
          />
        </div>
        <UFormField label="Spool Grams" hint="0 = null">
          <UInput
            v-model="filamentTypeForm.spoolGrams"
            type="number"
            class=""
          />
        </UFormField>
        <UButton type="submit" class="h-fit self-end">Update</UButton>
      </UForm>
    </div>
  </div>
</template>
