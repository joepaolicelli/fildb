import { defineStore } from 'pinia';

export const useLayoutStore = defineStore('layout', () => {
  const adminSidebarOpen = ref(false);

  return { adminSidebarOpen };
});
