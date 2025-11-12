<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const navItems = computed<NavigationMenuItem[]>(() => [
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
  <UHeader>
    <template #title>
      <div class="text-2xl">
        <b>FilDB</b>
      </div>
    </template>

    <UNavigationMenu :items="navItems" />

    <template #right>
      <UColorModeSwitch />
      <slot name="right"></slot>
    </template>

    <!-- Expanded hamburger content on small screens. -->
    <template #body>
      <UNavigationMenu
        :items="navItems"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
