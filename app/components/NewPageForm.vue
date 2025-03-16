<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { objectToSnake } from 'ts-case-convert';
import type { Reactive } from 'vue';
import { z } from 'zod';

import { useScrapers } from '~/queries/scrapers';
import { useSites } from '~/queries/sites';
import type { ScrapeStatus, ThemeColor } from '~/utils/utils';
import { icons } from '~/utils/utils';

const runtimeConfig = useRuntimeConfig();
const supabase = useSupabaseClient();
const toast = useToast();

const { sites } = useSites();
const { scrapers } = useScrapers();

if (sites.value.error) {
  toast.add({
    title: 'Error loading sites.',
    description: sites.value.error.message,
    icon: icons.error,
    color: 'error',
    duration: -1,
  });
}

const scrapeGroups = (runtimeConfig.public.scrapeGroups ?? '')
  .split(',')
  .map((g) => ({ name: g }));

const pageSchema = z.object({
  url: z.string().url(),
  scrapeUrl: z.string().url(),
  siteId: z.string().uuid(),
  scraperId: z.string().uuid(),
  scrapeGroup: z.string(),
  scrapeStatus: z.enum(['pending', 'active', 'paused', 'archived']),
});
type PageSchema = z.output<typeof pageSchema>;

const newPage = reactive({
  url: '',
  scrapeUrl: '',
  siteId: '',
  scraperId: '',
  scrapeGroup: '',
  scrapeStatus: 'pending' as ScrapeStatus,
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

const addPage = async (event: FormSubmitEvent<PageSchema>) => {
  status.showAlert = false;
  status.sending = true;
  const { error } = await supabase
    .from('pages')
    .insert(objectToSnake({ id: crypto.randomUUID(), ...event.data }));
  if (error) {
    status.alertColor = 'error';
    status.alertText = `Error: ${error.message}`;
    status.showAlert = true;
    console.log(error);
  } else {
    status.alertColor = 'success';
    status.alertText = 'Created!';
    status.showAlert = true;
    newPage.url = '';
    newPage.scrapeUrl = '';
    newPage.siteId = '';
    newPage.scraperId = '';
    newPage.scrapeGroup = '';
    newPage.scrapeStatus = 'pending';
  }
  status.sending = false;
};
</script>
<template>
  <UForm
    :schema="pageSchema"
    :state="newPage"
    class="my-2 flex flex-wrap items-stretch gap-2 rounded-xl border border-slate-400 p-3"
    @submit="addPage"
  >
    <UFormField label="URL" name="url">
      <UInput v-model="newPage.url" class="min-w-48" />
    </UFormField>
    <UFormField label="Scrape URL" name="scrapeUrl">
      <UInput v-model="newPage.scrapeUrl" class="min-w-48" />
    </UFormField>
    <UFormField label="Site" name="siteId">
      <USelectMenu
        v-model="newPage.siteId"
        value-key="id"
        label-key="name"
        :items="sites.data"
        class="min-w-48"
      />
    </UFormField>
    <UFormField label="Scraper" name="scraperId">
      <USelectMenu
        v-model="newPage.scraperId"
        value-key="id"
        label-key="name"
        :items="scrapers.data"
        class="min-w-48"
      />
    </UFormField>
    <UFormField label="Scrape Group" name="scrapeGroup">
      <USelectMenu
        v-model="newPage.scrapeGroup"
        value-key="name"
        label-key="name"
        :items="scrapeGroups"
        class="min-w-48"
      />
    </UFormField>
    <UFormField label="Scrape Status" name="scrapeStatus">
      <USelect
        v-model="newPage.scrapeStatus"
        :items="['pending', 'active', 'paused', 'archived']"
        class="min-w-48"
      />
    </UFormField>
    <UButton type="submit" :loading="status.sending" class="h-fit self-center">
      Create
    </UButton>
    <UAlert
      v-if="status.showAlert"
      :color="status.alertColor"
      variant="subtle"
      :title="status.alertText"
      :icon="status.alertColor === 'success' ? icons.success : icons.error"
      class="h-fit w-fit self-center"
    />
  </UForm>
</template>
