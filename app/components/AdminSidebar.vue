<script setup lang="ts">
interface SidebarStatus {
  open: boolean;
}

const props = defineProps<{
  sidebarStatus: SidebarStatus;
}>();
defineEmits(['toggleSidebar']);

const user = useSupabaseUser();
</script>
<template>
  <aside
    class="hidden overflow-y-auto lg:sticky lg:top-0 lg:block lg:max-h-screen"
  >
    <UButton @click="$emit('toggleSidebar')">>></UButton>
    <div>Admin Dashboard</div>
    <div>Logged in as {{ user?.email }}.</div>
  </aside>
</template>
