<script setup lang="ts">
import type { InputMenuItem } from '@nuxt/ui';
import { useMutation } from '@pinia/colada';
import _ from 'lodash';
import { objectToSnake } from 'ts-case-convert';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { Tables } from '~~/types/database.types';
import { useBrands } from '~/queries/brands';

const supabase = useSupabaseClient();
const toast = useToast();
const statusToaster = new StatusToaster('Bulk Products');

const { brands } = useBrands();

const { products } = defineProps<{
  products: PendingProduct[];
}>();
const emit = defineEmits(['clearAll', 'refetchAll', 'selectAll']);

const selectedProducts = computed(() => {
  return products.filter((p) => p != null && p.selected);
});

const brand = ref('');
const brandNotes = ref('');
const brandOptions = computed((): InputMenuItem[] => {
  if (brands.value.error) {
    toast.add({
      title: 'Error loading brands.',
      description: brands.value.error.message,
      icon: icons.error,
      color: 'error',
      duration: -1,
    });
  } else if (brands.value.data) {
    return [
      ...brands.value.data.map(
        (brand: CamelCasedPropertiesDeep<Tables<'brands'>>) => ({
          label: brand.name,
          value: brand.id,
        }),
      ),
    ];
  }

  return [{ label: '[null]', value: '[null]' }];
});

watch(
  [() => products, () => brands],
  () => {
    if (brands.value.data) {
      const currentBrands = _.uniq(
        selectedProducts.value.map((p) => p.brandId),
      );
      if (currentBrands.length === 1) {
        brand.value = currentBrands[0] ?? '';
        brandNotes.value = `Current brand for all: ${
          brands.value.data.find((b) => b.id === currentBrands[0])?.name
        }`;
      } else {
        brand.value = '';
        brandNotes.value = `${currentBrands.length} current brands`;
      }
    }
  },
  { immediate: true, deep: true },
);

const sending = ref(false);

const { mutate: updateBrand } = useMutation({
  mutation: async () => {
    sending.value = true;

    const { error } = await supabase
      .from('products')
      .update(
        objectToSnake({
          brandId: brand.value,
        }),
      )
      .in(
        'id',
        selectedProducts.value.map((p) => p.id),
      );

    if (error) {
      statusToaster.error('Brand Update Failed!', error.message);
      console.log(error);
    } else {
      statusToaster.success('Brand Updated!');
    }
    sending.value = false;
  },
  onSettled: async () => emit('refetchAll'),
});
</script>
<template>
  <div>
    <div>
      <div class="flex gap-2">
        <div class="self-center">
          {{ products.filter((p) => p.selected).length }} Unique Products
          Selected
        </div>
        <UButton label="Select All" @click="emit('selectAll')" />
        <UButton label="Clear All" @click="emit('clearAll')" />
      </div>
      <div class="mt-2 flex">
        <div class="m-1 rounded-lg border-1 border-slate-400 p-2">
          <UFormField label="Brand" :help="brandNotes">
            <UFieldGroup>
              <UInputMenu
                v-model="brand"
                value-key="value"
                :items="brandOptions"
                placeholder="---"
                class="min-w-48"
              />
              <UButton
                :disabled="brand === ''"
                :loading="sending"
                @click="updateBrand()"
                >Update</UButton
              >
            </UFieldGroup>
          </UFormField>
        </div>
      </div>
    </div>
  </div>
</template>
