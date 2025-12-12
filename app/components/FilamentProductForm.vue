<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui';
import { useMutation, useQuery } from '@pinia/colada';
import { objectToCamel, objectToSnake } from 'ts-case-convert';
import type { CamelCasedPropertiesDeep } from 'type-fest';
import type { Reactive } from 'vue';
import { z } from 'zod';

import type { Tables } from '~~/types/database.types';
import { useFilamentMaterialClasses } from '~/queries/filamentMaterialClasses';

const props = defineProps<{
  filament: CamelCasedPropertiesDeep<Tables<'filaments'>>;
  product: CamelCasedPropertiesDeep<Tables<'products'>>;
}>();
const emit = defineEmits(['refetch']);

const supabase = useSupabaseClient();
const toast = useToast();
const statusToaster = new StatusToaster('Filament Info');

const { filamentMaterialClasses } = useFilamentMaterialClasses();

const filamentFormSchema = z.object({
  material: z.string(),
  materialClass: z.string(),
  colorName: z.string(),
  colorHex: z.union([z.string().min(6).max(8), z.string().length(0)]),
});
type FilamentFormSchema = z.output<typeof filamentFormSchema>;

const form: Reactive<z.infer<typeof filamentFormSchema>> = reactive({
  material: '',
  materialClass: '[null]',
  colorName: '',
  colorHex: '',
});

watch(
  () => props.filament,
  () => {
    form.material = props.filament.material ?? '';
    form.materialClass = props.filament.materialClass ?? '[null]';
    form.colorName = props.filament.colorName ?? '';
    form.colorHex = props.filament.colorHex ?? '';

    statusToaster.updateContext(`Filament Info: ${props.product.name}`);
  },
  { immediate: true },
);

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

const sending = ref(false);

const { mutate: updateFilament } = useMutation({
  mutation: async (updates: FilamentFormSchema) => {
    sending.value = true;

    const { error } = await supabase
      .from('filaments')
      .update(
        objectToSnake({
          material: updates.material === '' ? null : updates.material,
          materialClass:
            updates.materialClass === '[null]' ? null : updates.materialClass,
          colorName: updates.colorName === '' ? null : updates.colorName,
          colorHex: updates.colorHex === '' ? null : updates.colorHex,
        }),
      )
      .eq('product_id', props.filament.productId);
    if (error) {
      statusToaster.error('Update Failed!', error.message);
      console.log(error);
    } else {
      statusToaster.success('Updated!');
    }
    sending.value = false;
  },
  onSettled: async () => emit('refetch'),
});
</script>
<template>
  <UForm
    aria-label="Product Filament"
    :schema="filamentFormSchema"
    :state="form"
    :disabled="sending"
    class="flex flex-wrap gap-x-4 gap-y-3"
    @submit="() => updateFilament(form)"
  >
    <UFormField
      label="Material"
      name="material"
      :ui="
        textFormFieldEquiv(props.filament.material, form.material)
          ? {}
          : modFormFieldStyles
      "
    >
      <UInput v-model="form.material" class="min-w-40" />
    </UFormField>
    <UFormField
      label="Material Class"
      name="materialClass"
      :ui="
        enumFormFieldEquiv(props.filament.materialClass, form.materialClass)
          ? {}
          : modFormFieldStyles
      "
    >
      <USelect
        v-model="form.materialClass"
        :items="materialClassOptions"
        class="min-w-40"
      />
    </UFormField>
    <UFormField
      label="Color Name"
      name="colorName"
      :ui="
        textFormFieldEquiv(props.filament.colorName, form.colorName)
          ? {}
          : modFormFieldStyles
      "
    >
      <UInput v-model="form.colorName" class="min-w-40" />
    </UFormField>
    <UFormField
      label="Color Hex"
      name="colorHex"
      hint="No #"
      :ui="
        textFormFieldEquiv(props.filament.colorHex, form.colorHex)
          ? {}
          : modFormFieldStyles
      "
    >
      <UInput v-model="form.colorHex" class="min-w-20" />
    </UFormField>
    <UButton type="submit" color="info" class="h-fit self-end">Update</UButton>
  </UForm>
</template>
