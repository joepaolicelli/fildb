<script setup lang="ts">
const navItems = ref([
  {
    label: 'Home',
    to: '/',
  },
  {
    label: 'Admin',
    to: '/admin',
  },
]);
</script>
<template>
  <div class="flex justify-between">
    <div>
      <b>FilDB</b>
    </div>
    <UNavigationMenu :items="navItems" />
    <div>
      <slot name="right"></slot>
    </div>
  </div>
</template>
