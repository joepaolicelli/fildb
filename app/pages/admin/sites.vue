<script setup lang="ts">
definePageMeta({ layout: 'admin' });
</script>
<template>
  <div>
    <div class="text-xl italic">Sites</div>
    <NewSiteForm />
    <SitesTable />
  </div>
</template>
