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
const emit = defineEmits(['refetch']);

const supabase = useSupabaseClient();

const filamentFormSchema = z.object({
  material: z.string(),
  colorName: z.string(),
  colorHex: z.union([z.string().min(6).max(8), z.string().length(0)]),
});
type FilamentFormSchema = z.output<typeof filamentFormSchema>;

const form: Reactive<z.infer<typeof filamentFormSchema>> = reactive({
  material: '',
  colorName: '',
  colorHex: '',
});

watch(
  () => props.filament,
  () => {
    form.material = props.filament.material ?? '';
    form.colorName = props.filament.colorName ?? '';
    form.colorHex = props.filament.colorHex ?? '';
  },
  { immediate: true },
);

const filamentStatus: Reactive<{
  sending: boolean;
  showAlert: boolean;
  alertText: string;
  alertColor: ThemeColor;
}> = reactive({
  sending: false,
  showAlert: false,
  alertText: '',
  alertColor: 'neutral',
});

const { mutate: updateFilament } = useMutation({
  mutation: async (updates: FilamentFormSchema) => {
    filamentStatus.showAlert = false;
    filamentStatus.sending = true;

    const { error } = await supabase
      .from('filaments')
      .update(
        objectToSnake({
          material: updates.material === '' ? null : updates.material,
          colorName: updates.colorName === '' ? null : updates.colorName,
          colorHex: updates.colorHex === '' ? null : updates.colorHex,
        }),
      )
      .eq('product_id', props.filament.productId);
    if (error) {
      filamentStatus.alertColor = 'error';
      filamentStatus.alertText = `Error: ${error.message}`;
      filamentStatus.showAlert = true;
      console.log(error);
    } else {
      filamentStatus.alertColor = 'success';
      filamentStatus.alertText = 'Updated!';
      filamentStatus.showAlert = true;
    }
    filamentStatus.sending = false;
  },
  onSettled: async () => emit('refetch'),
});
</script>
<template>
  <UForm
    :schema="filamentFormSchema"
    :state="form"
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
