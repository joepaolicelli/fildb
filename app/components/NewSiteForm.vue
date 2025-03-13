<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import type { Reactive } from 'vue';
import { z } from 'zod';

import type { ThemeColor } from '~/utils/utils';

const supabase = useSupabaseClient();

const siteSchema = z.object({
  name: z.string().min(1),
  homepage: z.string().url(),
});
type SiteSchema = z.output<typeof siteSchema>;

const newSite = reactive({
  name: '',
  homepage: '',
});

const status: Reactive<{
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

const addSite = async (event: FormSubmitEvent<SiteSchema>) => {
  status.showAlert = false;
  status.sending = true;
  const { error } = await supabase
    .from('sites')
    .insert({ id: crypto.randomUUID(), ...event.data });
  if (error) {
    status.alertColor = 'error';
    status.alertText = `Error: ${error.message}`;
    status.showAlert = true;
    console.log(error);
  } else {
    status.alertColor = 'success';
    status.alertText = 'Created!';
    status.showAlert = true;
    newSite.name = '';
    newSite.homepage = '';
  }
  status.sending = false;
};
</script>
<template>
  <UForm
    :schema="siteSchema"
    :state="newSite"
    class="my-2 flex h-27 items-stretch gap-2 rounded-xl border border-slate-400 p-3"
    @submit="addSite"
  >
    <UFormField label="Name" name="name">
      <UInput v-model="newSite.name" />
    </UFormField>
    <UFormField label="Homepage" name="homepage">
      <UInput v-model="newSite.homepage" />
    </UFormField>
    <UButton type="submit" :loading="status.sending" class="h-fit self-center">
      Create
    </UButton>
    <UAlert
      v-if="status.showAlert"
      :color="status.alertColor"
      variant="subtle"
      :title="status.alertText"
      :icon="
        status.alertColor === 'success'
          ? 'solar:check-circle-linear'
          : 'solar:close-circle-outline'
      "
      class="h-fit w-fit self-center"
    />
  </UForm>
</template>
