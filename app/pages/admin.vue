<script setup lang="ts">
const user = useSupabaseUser();
</script>
<template>
  <div>
    <div>Admin Dashboard</div>
    <div>Logged in as {{ user?.email }}.</div>
    <NuxtPage />
  </div>
</template>
