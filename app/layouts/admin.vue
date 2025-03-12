<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
const layoutStore = useLayoutStore();
</script>
<template>
  <div
    class="grid min-h-screen transition-[grid-template-columns] duration-300 ease-in-out"
    :class="{
      'grid-cols-[300px_auto]': layoutStore.adminSidebarOpen,
      'grid-cols-[64px_auto]': !layoutStore.adminSidebarOpen,
    }"
  >
    <AdminSidebar />
    <div>
      <SiteHeader>
        <template #right>
          <UButton
            icon="solar:hamburger-menu-linear"
            @click="
              layoutStore.adminSidebarOpen = !layoutStore.adminSidebarOpen
            "
          />
        </template>
      </SiteHeader>
      <slot></slot>
    </div>
  </div>
</template>
