<script setup lang="ts">
import { useQuery } from '@pinia/colada';
import { objectToCamel } from 'ts-case-convert';
import type { Reactive } from 'vue';
import { z } from 'zod';

import { productTypes } from '~~/db/schema';
import { useBrands } from '~/queries/brands';

const props = defineProps<{
  productId: string;
}>();

const client = useSupabaseClient();
const toast = useToast();

const { brands } = useBrands();

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

const assignFilDbId = async () => {
  try {
    if (!brands.value.data) {
      throw brands.value.error ?? new Error('Issue with brands.');
    }
    if (!product.value.data) {
      throw product.value.error ?? new Error('Issue with product data.');
    }
    if (!product.value.data.type) {
      throw new Error('Product type must be set before getting FilDB ID.');
    }

    const brand = brands.value.data.find(
      (b) => b.id === product.value.data?.brandId,
    );

    if (!brand || brand.brandCodes.length === 0) {
      throw new Error('Unable to find brand code.');
    }

    let idStart = brand.brandCodes[0]?.toUpperCase();

    if (product.value.data.type !== 'filament') {
      const productType = productTypesInfo.find(
        (t) => t.type === product.value.data?.type,
      );

      if (!productType || productType.letter) {
        throw new Error('Unable to find product type letter.');
      }

      idStart = `${idStart}${productType.letter.toUpperCase}`;
    }

    const resp = await client
      .from('products')
      .select('fil_db_id')
      .eq('type', product.value.data.type)
      .ilike('fil_db_id', `${idStart}%`)
      .order('fil_db_id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (resp.error) {
      console.log(resp.error);
      throw resp.error;
    }

    // Null means no matching rows found.
    if (resp.data === null) {
      form.filDbId =
        product.value.data.type === 'filament'
          ? `${idStart}0001`
          : `${idStart}001`;
    } else if (resp.data) {
      const lastId = objectToCamel(resp.data).filDbId;

      if (lastId) {
        const newNum =
          product.value.data.type === 'filament'
            ? `${parseInt(lastId?.substring(3)) + 1}`.padStart(4, '0')
            : `${parseInt(lastId?.substring(4)) + 1}`.padStart(3, '0');

        form.filDbId = `${idStart}${newNum}`;
      }
    }
  } catch (err) {
    console.log(err);
    toast.add({
      title: 'Error getting new FilDB ID.',
      description: err instanceof Error ? err.message : '',
      icon: icons.error,
      color: 'error',
      duration: -1,
    });
  }
};
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
        <div class="flex flex-row">
          <UFormField
            label="FilDB ID"
            :ui="
              product.data.filDbId === form.filDbId ||
              (product.data.filDbId == null && form.filDbId === '')
                ? {}
                : modFormFieldStyles
            "
          >
            <UInput v-model="form.filDbId" class="min-w-20" />
          </UFormField>
          <UButton
            icon="solar:add-square-linear"
            variant="outline"
            class="ml-1 h-fit self-end"
            @click="assignFilDbId"
          />
        </div>
        <UFormField
          label="Name"
          :ui="product.data.name === form.name ? {} : modFormFieldStyles"
        >
          <UInput v-model="form.name" class="min-w-80" />
        </UFormField>
        <UFormField
          label="Brand ID"
          :ui="product.data.brandId === form.brandId ? {} : modFormFieldStyles"
        >
          <UInput v-model="form.brandId" class="min-w-80" />
        </UFormField>
        <UFormField
          label="Type"
          :ui="
            product.data.type === form.type ||
            (product.data.type == null && form.type === '[null]')
              ? {}
              : modFormFieldStyles
          "
        >
          <USelect v-model="form.type" :items="typeOptions" class="min-w-40" />
        </UFormField>
        <UButton type="submit" color="info" class="h-fit self-end"
          >Update</UButton
        >
      </UForm>
      <USeparator class="my-2" />
      <UForm
        v-if="product.data.type === 'filament'"
        :schema="filamentFormSchema"
        :state="filamentTypeForm"
        class="flex flex-wrap gap-x-4 gap-y-3"
      >
        <UFormField
          label="Material"
          :ui="
            product.data.filaments?.material === filamentTypeForm.material ||
            (product.data.filaments?.material == null &&
              filamentTypeForm.material === '')
              ? {}
              : modFormFieldStyles
          "
        >
          <UInput v-model="filamentTypeForm.material" class="min-w-40" />
        </UFormField>
        <UFormField
          label="Color Name"
          :ui="
            product.data.filaments?.colorName === filamentTypeForm.colorName ||
            (product.data.filaments?.colorName == null &&
              filamentTypeForm.colorName === '')
              ? {}
              : modFormFieldStyles
          "
        >
          <UInput v-model="filamentTypeForm.colorName" class="min-w-40" />
        </UFormField>
        <UFormField
          label="Color Hex"
          hint="No #"
          :ui="
            product.data.filaments?.colorHex === filamentTypeForm.colorHex ||
            (product.data.filaments?.colorHex == null &&
              filamentTypeForm.colorHex === '')
              ? {}
              : modFormFieldStyles
          "
        >
          <UInput v-model="filamentTypeForm.colorHex" class="min-w-20" />
        </UFormField>
        <UButton type="submit" color="info" class="h-fit self-end"
          >Update</UButton
        >
      </UForm>
    </div>
  </div>
</template>
