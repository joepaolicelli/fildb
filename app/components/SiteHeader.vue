<script setup lang="ts">
const navItems = ref([
  {
    label: 'Home',
    to: '/',
  },
  {
    label: 'Filaments',
    to: '/filaments',
  },
  {
    label: 'Admin',
    to: '/admin',
  },
]);
</script>
<template>
  <div class="sticky top-0 flex justify-between p-3">
    <div class="self-center text-2xl">
      <b>FilDB</b>
    </div>
    <div>
      <UNavigationMenu :items="navItems" class="self-center" />
    </div>
    <div>
      <slot name="right"></slot>
    </div>
  </div>
</template>
