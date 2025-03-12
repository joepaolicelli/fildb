<script setup lang="ts">
const sidebarStatus = reactive({
  open: true,
});
</script>
<template>
  <div
    class="grid min-h-screen transition-[grid-template-columns] duration-300 ease-in-out"
    :class="{
      'grid-cols-[300px_auto]': sidebarStatus.open,
      'grid-cols-[64px_auto]': !sidebarStatus.open,
    }"
  >
    <AdminSidebar
      :sidebar-status="sidebarStatus"
      @toggle-sidebar="
        sidebarStatus.open
          ? (sidebarStatus.open = false)
          : (sidebarStatus.open = true)
      "
    />
    <div>
      <SiteHeader>
        <template #right>
          <UButton>>></UButton>
        </template>
      </SiteHeader>
      <slot></slot>
    </div>
  </div>
</template>
