<script setup lang="ts">
import { useMutation, useQuery } from '@pinia/colada';
import { objectToCamel, objectToSnake } from 'ts-case-convert';
import type { CamelCasedPropertiesDeep } from 'type-fest';
import type { Reactive } from 'vue';
import { z } from 'zod';

import type { Tables } from '~~/types/database.types';

const props = defineProps<{
  filament: CamelCasedPropertiesDeep<Tables<'filaments'>>;
}>();

const filamentFormSchema = z.object({
  material: z.string(),
  colorName: z.string(),
  colorHex: z.string().min(6).max(8),
});
type FilamentFormSchema = z.output<typeof filamentFormSchema>;

const filamentTypeForm: Reactive<z.infer<typeof filamentFormSchema>> =
  reactive({
    material: '',
    colorName: '',
    colorHex: '',
  });

watch(
  () => props.filament,
  () => {
    filamentTypeForm.material = props.filament.material ?? '';
    filamentTypeForm.colorName = props.filament.colorName ?? '';
    filamentTypeForm.colorHex = props.filament.colorHex ?? '';
  },
  { immediate: true },
);
</script>
<template>
  <UForm
    :schema="filamentFormSchema"
    :state="filamentTypeForm"
    class="flex flex-wrap gap-x-4 gap-y-3"
  >
    <UFormField
      label="Material"
      :ui="
        textFormFieldEquiv(props.filament.material, filamentTypeForm.material)
          ? {}
          : modFormFieldStyles
      "
    >
      <UInput v-model="filamentTypeForm.material" class="min-w-40" />
    </UFormField>
    <UFormField
      label="Color Name"
      :ui="
        textFormFieldEquiv(
          props.filament.colorName,
          filamentTypeForm.colorName,
        )
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
        textFormFieldEquiv(props.filament.colorHex, filamentTypeForm.colorHex)
          ? {}
          : modFormFieldStyles
      "
    >
      <UInput v-model="filamentTypeForm.colorHex" class="min-w-20" />
    </UFormField>
    <UButton type="submit" color="info" class="h-fit self-end">Update</UButton>
  </UForm>
</template>
