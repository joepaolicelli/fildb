<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';

const layoutStore = useLayoutStore();
const user = useSupabaseUser();
</script>
<template>
  <aside
    class="hidden overflow-y-auto lg:sticky lg:top-0 lg:block lg:max-h-screen"
  >
    <UButton
      @click="layoutStore.adminSidebarOpen = !layoutStore.adminSidebarOpen"
      >>></UButton
    >
    <div>Admin Dashboard</div>
    <div>Logged in as {{ user?.email }}.</div>
  </aside>
</template>
