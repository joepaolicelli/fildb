<script setup lang="ts">
import type { CamelCasedPropertiesDeep } from 'type-fest';

import type { Tables } from '~~/types/database.types';
import { useFilamentMaterialClasses } from '~/queries/filamentMaterialClasses';

const { filamentMaterialClasses } = useFilamentMaterialClasses();

const props = defineProps<{
  product: CamelCasedPropertiesDeep<Tables<'products'>> & {
    filaments: CamelCasedPropertiesDeep<Tables<'filaments'>> | null;
    tags: CamelCasedPropertiesDeep<Tables<'tags'>>[];
    variants: CamelCasedPropertiesDeep<Tables<'variants'>>[];
  };
}>();

let materialClassName: string | null = null;

watch(
  [() => props.product, () => filamentMaterialClasses],
  () => {
    if (filamentMaterialClasses.value.data) {
      materialClassName =
        filamentMaterialClasses.value.data.find(
          (mc) => mc.id === props.product.filaments?.materialClass,
        )?.name ?? null;
    }
  },
  { immediate: true, deep: true },
);
</script>
<template>
  <div>
    <div v-if="product.filaments">
      <div class="my-1">
        <UBadge
          color="neutral"
          variant="subtle"
          class="mr-2 rounded-sm px-2 py-1 font-bold"
          >{{ materialClassName }}</UBadge
        >
        <span>{{ product.filaments.material }}</span>
      </div>
      <div class="my-1">
        <span class="mr-2">{{ product.filaments.colorName }}</span>
        <span>{{ product.filaments.colorHex }}</span>
      </div>
    </div>
  </div>
</template>
