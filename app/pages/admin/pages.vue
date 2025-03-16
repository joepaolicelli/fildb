<script setup lang="ts">
definePageMeta({ layout: 'admin' });
</script>
<template>
  <div>
    <div class="text-xl italic">Pages</div>
    <NewPageForm />
    <PagesTable />
  </div>
</template>
