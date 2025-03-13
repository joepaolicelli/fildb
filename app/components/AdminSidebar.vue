<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';

const layoutStore = useLayoutStore();
const user = useSupabaseUser();

const navItems = ref([
  {
    label: 'Pending',
    to: '/admin/pending',
    icon: 'solar:pen-new-square-line-duotone',
  },
  {
    label: 'Sites',
    to: '/admin/sites',
    icon: 'solar:global-line-duotone',
  },
  {
    label: 'Pages',
    to: '/admin/pages',
    icon: 'solar:document-line-duotone',
  },
  {
    label: 'Scrapers',
    to: '/admin/scrapers',
    icon: 'mdi:robot-excited-outline',
  },
]);
</script>
<template>
  <aside
    class="max-h-screen min-h-screen overflow-y-auto lg:visible lg:sticky lg:top-0 lg:block"
  >
    <div class="flex h-full flex-col gap-10 p-3">
      <UButton
        :icon="
          layoutStore.adminSidebarOpen
            ? 'solar:double-alt-arrow-left-linear'
            : 'solar:double-alt-arrow-right-linear'
        "
        class="w-min"
        :class="{
          'self-center': !layoutStore.adminSidebarOpen,
          'self-end': layoutStore.adminSidebarOpen,
        }"
        @click="layoutStore.adminSidebarOpen = !layoutStore.adminSidebarOpen"
      />
      <!-- Nav-->
      <div class="flex w-full grow flex-col self-center">
        <Transition
          enter-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-300"
          leave-from-class="opacity-100 "
          leave-to-class="opacity-0"
          mode="out-in"
        >
          <div
            v-if="!layoutStore.adminSidebarOpen"
            class="flex flex-col self-center"
          >
            <ULink
              v-for="navItem of navItems"
              :key="navItem.label"
              :to="navItem.to"
              ><UIcon
                :name="navItem.icon"
                class="my-3 size-8 self-center py-3"
            /></ULink>
          </div>
          <div v-else>
            <UNavigationMenu orientation="vertical" :items="navItems" />
          </div>
        </Transition>
      </div>
      <div v-if="!layoutStore.adminSidebarOpen" class="self-center">
        <UIcon
          name="solar:user-circle-line-duotone"
          class="size-8 self-center"
        />
      </div>
      <div v-else>{{ user?.email }}</div>
    </div>
  </aside>
</template>
