<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui';
import { useMutation } from '@pinia/colada';
import _ from 'lodash';
import { objectToSnake } from 'ts-case-convert';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { Tables } from '~~/types/database.types';
import { useFilamentMaterialClasses } from '~/queries/filamentMaterialClasses';

const supabase = useSupabaseClient();
const toast = useToast();
const statusToaster = new StatusToaster('Bulk Products');

const { filamentMaterialClasses } = useFilamentMaterialClasses();

const { products } = defineProps<{
  products: PendingProduct[];
}>();
const emit = defineEmits(['refetchAll']);

const selectedProducts = computed(() => {
  return products.filter((p) => p != null && p.selected);
});

const material = ref('');
const materialNotes = ref('');

const materialClass = ref('[null]');
const materialClassNotes = ref('');
const materialClassOptions = computed((): SelectItem[] => {
  if (filamentMaterialClasses.value.error) {
    toast.add({
      title: 'Error loading filament material classes.',
      description: filamentMaterialClasses.value.error.message,
      icon: icons.error,
      color: 'error',
      duration: -1,
    });
  } else if (filamentMaterialClasses.value.data) {
    return [
      { label: '[null]', value: '[null]' },
      ...filamentMaterialClasses.value.data.map(
        (
          mc: CamelCasedPropertiesDeep<Tables<'filament_material_classes'>>,
        ) => ({
          label: mc.name,
          value: mc.id,
        }),
      ),
    ];
  }

  return [{ label: '[null]', value: '[null]' }];
});

watch(
  [() => products, () => filamentMaterialClasses],
  () => {
    // Material
    const currentMaterials = _.uniq(
      selectedProducts.value.map((p) => p.filaments?.material),
    ).filter((p) => p != null);
    if (currentMaterials.length === 1) {
      material.value = currentMaterials[0] ?? '';
      materialNotes.value = `Current material for all: ${currentMaterials[0]}`;
    } else {
      material.value = '';
      materialNotes.value = `${currentMaterials.length} current materials`;
    }

    // Material Class
    if (filamentMaterialClasses.value.data) {
      const currentFMCs = _.uniq(
        selectedProducts.value.map((p) => p.filaments?.materialClass),
      ).filter((p) => p != null);
      if (currentFMCs.length === 1) {
        materialClass.value = currentFMCs[0] ?? '';
        materialClassNotes.value = `Current material class for all: ${
          filamentMaterialClasses.value.data.find(
            (fmc) => fmc.id === currentFMCs[0],
          )?.name
        }`;
      } else {
        materialClass.value = '';
        materialClassNotes.value = `${currentFMCs.length} current material classes`;
      }
    }
  },
  { immediate: true, deep: true },
);

const sending = ref(false);

const { mutate: updateMaterial } = useMutation({
  mutation: async () => {
    sending.value = true;

    const { error } = await supabase
      .from('filaments')
      .update(
        objectToSnake({
          material: material.value === '' ? null : material.value,
        }),
      )
      .in(
        'product_id',
        selectedProducts.value.map((p) => p.id),
      );

    if (error) {
      statusToaster.error('Material Update Failed!', error.message);
      console.log(error);
    } else {
      statusToaster.success('Material Updated!');
    }
    sending.value = false;
  },
  onSettled: async () => emit('refetchAll'),
});

const { mutate: updateMaterialClass } = useMutation({
  mutation: async () => {
    sending.value = true;

    if (materialClass.value === '') {
      statusToaster.error(
        'Material Class Update Failed!',
        'No material class selected.',
      );
    } else {
      const { error } = await supabase
        .from('filaments')
        .update(
          objectToSnake({
            materialClass:
              materialClass.value === '[null]' ? null : materialClass.value,
          }),
        )
        .in(
          'product_id',
          selectedProducts.value.map((p) => p.id),
        );

      if (error) {
        statusToaster.error('Material Class Update Failed!', error.message);
        console.log(error);
      } else {
        statusToaster.success('Material Class Updated!');
      }
    }
    sending.value = false;
  },
  onSettled: async () => emit('refetchAll'),
});
</script>
<template>
  <div>
    <div>
      <div class="mt-2 flex">
        <div class="m-1 rounded-lg border-1 border-slate-400 p-2">
          <UFormField label="Material" :help="materialNotes">
            <UFieldGroup>
              <UInput v-model="material" placeholder="---" class="min-w-48" />
              <UButton
                :disabled="sending"
                :loading="sending"
                @click="updateMaterial()"
                >Update</UButton
              >
            </UFieldGroup>
          </UFormField>
        </div>
        <div class="m-1 rounded-lg border-1 border-slate-400 p-2">
          <UFormField label="Material Class" :help="materialClassNotes">
            <UFieldGroup>
              <UInputMenu
                v-model="materialClass"
                value-key="value"
                :items="materialClassOptions"
                placeholder="---"
                class="min-w-48"
              />
              <UButton
                :disabled="sending || materialClass === ''"
                :loading="sending"
                @click="updateMaterialClass()"
                >Update</UButton
              >
            </UFieldGroup>
          </UFormField>
        </div>
      </div>
    </div>
  </div>
</template>
