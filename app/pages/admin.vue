<script setup lang="ts">
const user = useSupabaseUser();
</script>
<template>
  <div>Admin. {{ user?.email }}</div>
</template>
