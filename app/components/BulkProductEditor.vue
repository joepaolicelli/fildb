<script setup lang="ts">
import type { InputMenuItem } from '@nuxt/ui';
import { useMutation } from '@pinia/colada';
import _ from 'lodash';
import { objectToSnake } from 'ts-case-convert';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import { productTypes } from '~~/db/schema';
import type { Tables } from '~~/types/database.types';
import { useBrands } from '~/queries/brands';
import { useTags } from '~/queries/tags';

const supabase = useSupabaseClient();
const toast = useToast();
const statusToaster = new StatusToaster('Bulk Products');

const { brands } = useBrands();
const { tags } = useTags();

const { products } = defineProps<{
  products: PendingProduct[];
}>();
const emit = defineEmits(['clearAll', 'refetchAll', 'selectAll']);

const availableTagsByCategory: Ref<
  ReturnType<typeof getTagsForProductTypeByCategory>
> = ref([]);

const selectedProducts = computed(() => {
  return products.filter((p) => p != null && p.selected);
});

const brand = ref('');
const brandNotes = ref('');
const brandOptions = computed((): InputMenuItem[] => {
  if (brands.value.error) {
    toast.add({
      title: 'Error loading brands.',
      description: brands.value.error.message,
      icon: icons.error,
      color: 'error',
      duration: -1,
    });
  } else if (brands.value.data) {
    return [
      ...brands.value.data.map(
        (brand: CamelCasedPropertiesDeep<Tables<'brands'>>) => ({
          label: brand.name,
          value: brand.id,
        }),
      ),
    ];
  }

  return [{ label: '[null]', value: '[null]' }];
});

type productTypeType = '' | '[null]' | (typeof productTypes)[number];
const productType: Ref<productTypeType> = ref('[null]');
const productTypeNotes = ref('');
const productTypeOptions = ref(['[null]', ...productTypes]);

const tagsToAdd: Ref<string[]> = ref([]);
const tagsToRemove: Ref<string[]> = ref([]);
const addTagToBeChanged = (tagId: string, selected: boolean | string) => {
  // Selected is reversed because it is the value of the checkbox before the
  // change.
  if (selected === false || selected === 'indeterminate') {
    tagsToAdd.value = _.uniq([...tagsToAdd.value, tagId]);
    tagsToRemove.value = tagsToRemove.value.filter((t) => t !== tagId);
  } else if (selected === true) {
    tagsToRemove.value = _.uniq([...tagsToRemove.value, tagId]);
    tagsToAdd.value = tagsToAdd.value.filter((t) => t !== tagId);
  }
};

watch(
  [() => products, () => brands, () => tags],
  () => {
    // Brand
    if (brands.value.data) {
      const currentBrands = _.uniq(
        selectedProducts.value.map((p) => p.brandId),
      );
      if (currentBrands.length === 1) {
        brand.value = currentBrands[0] ?? '';
        brandNotes.value = `Current brand for all: ${
          brands.value.data.find((b) => b.id === currentBrands[0])?.name
        }`;
      } else {
        brand.value = '';
        brandNotes.value = `${currentBrands.length} current brands`;
      }
    }

    // Type
    const currentTypes = _.uniq(selectedProducts.value.map((p) => p.type));
    if (currentTypes.length === 1) {
      productType.value = currentTypes[0] ?? '';
      productTypeNotes.value = `Current type for all: ${currentTypes[0]}`;
    } else {
      productType.value = '';
      productTypeNotes.value = `${currentTypes.length} current types`;
    }

    // Tags
    if (tags?.value?.data && currentTypes.length === 1) {
      availableTagsByCategory.value = getTagsForProductTypeByCategory(
        tags.value.data ?? [],
        currentTypes[0] ?? null,
      );
      for (const tagCat of availableTagsByCategory.value) {
        if (tagCat.tags) {
          for (const tag of tagCat.tags) {
            const checkedCount = selectedProducts.value.reduce((acc, p) => {
              if (p.tags.map((t) => t.id).includes(tag.id)) {
                return acc + 1;
              }
              return acc;
            }, 0);

            if (checkedCount === selectedProducts.value.length) {
              tag.selected = true;
            } else if (checkedCount === 0) {
              tag.selected = false;
            } else {
              tag.selected = 'indeterminate';
            }
            tag.selectedCount = checkedCount;
          }
        }
      }
    }
  },
  { immediate: true, deep: true },
);

const sending = ref(false);

const { mutate: updateBrand } = useMutation({
  mutation: async () => {
    sending.value = true;

    const { error } = await supabase
      .from('products')
      .update(
        objectToSnake({
          brandId: brand.value,
        }),
      )
      .in(
        'id',
        selectedProducts.value.map((p) => p.id),
      );

    if (error) {
      statusToaster.error('Brand Update Failed!', error.message);
      console.log(error);
    } else {
      statusToaster.success('Brand Updated!');
    }
    sending.value = false;
  },
  onSettled: async () => emit('refetchAll'),
});

const { mutate: updateProductType } = useMutation({
  mutation: async () => {
    sending.value = true;

    if (productType.value === '') {
      statusToaster.error('Type Update Failed!', 'No type selected.');
    } else {
      const { error } = await supabase
        .from('products')
        .update(
          objectToSnake({
            type: productType.value === '[null]' ? null : productType.value,
          }),
        )
        .in(
          'id',
          selectedProducts.value.map((p) => p.id),
        );

      if (error) {
        statusToaster.error('Type Update Failed!', error.message);
        console.log(error);
      } else {
        statusToaster.success('Type Updated!');
      }
    }
    sending.value = false;
  },
  onSettled: async () => emit('refetchAll'),
});

const { mutate: updateTags } = useMutation({
  mutation: async () => {
    sending.value = true;

    let toAddErrored = false;
    let toRemoveErrored = false;
    if (tagsToAdd.value.length > 0) {
      const { error } = await supabase.from('product_tags').insert(
        tagsToAdd.value
          .filter((t) => t != null)
          .map((tag) =>
            selectedProducts.value.map((sp) =>
              objectToSnake({
                productId: sp.id,
                tagId: tag,
              }),
            ),
          )
          .flat(),
      );

      if (error) {
        statusToaster.error('Update Failed!', error.message);
        console.log(error);
        toAddErrored = true;
      } else {
        statusToaster.success('Updated!');
      }
    }

    if (!toAddErrored && tagsToRemove.value.length > 0) {
      for (const toRemove of tagsToRemove.value) {
        const { error } = await supabase
          .from('product_tags')
          .delete()
          .eq('tag_id', toRemove)
          .in(
            'product_id',
            selectedProducts.value.map((sp) => sp.id),
          );

        if (error) {
          statusToaster.error('Update Failed!', error.message);
          console.log(error);
          toRemoveErrored = true;
          break;
        }
      }

      if (!toAddErrored && !toRemoveErrored) {
        tagsToAdd.value = [];
        tagsToRemove.value = [];
        statusToaster.success('Updated!');
      }
    }

    sending.value = false;
  },
  onSettled: async () => emit('refetchAll'),
});
</script>
<template>
  <div>
    <div>
      <div class="flex gap-2">
        <div class="self-center">
          {{ products.filter((p) => p.selected).length }} Unique Products
          Selected
        </div>
        <UButton label="Select All" @click="emit('selectAll')" />
        <UButton label="Clear All" @click="emit('clearAll')" />
      </div>
      <div class="mt-2 flex">
        <div class="m-1 rounded-lg border-1 border-slate-400 p-2">
          <UFormField label="Brand" :help="brandNotes">
            <UFieldGroup>
              <UInputMenu
                v-model="brand"
                value-key="value"
                :items="brandOptions"
                placeholder="---"
                class="min-w-48"
              />
              <UButton
                :disabled="sending || brand === ''"
                :loading="sending"
                @click="updateBrand()"
                >Update</UButton
              >
            </UFieldGroup>
          </UFormField>
        </div>
        <div class="m-1 rounded-lg border-1 border-slate-400 p-2">
          <UFormField label="Type" :help="productTypeNotes">
            <UFieldGroup>
              <UInputMenu
                v-model="productType"
                value-key="value"
                :items="productTypeOptions"
                placeholder="---"
                class="min-w-48"
              />
              <UButton
                :disabled="sending || productType === ''"
                :loading="sending"
                @click="updateProductType()"
                >Update</UButton
              >
            </UFieldGroup>
          </UFormField>
        </div>
      </div>
      <BulkProductEditorFilamentFields
        :products="products"
        @refetch-all="emit('refetchAll')"
      />
      <div>
        <div class="flex flex-wrap">
          <div
            v-for="tagCat of availableTagsByCategory"
            :key="tagCat.categoryName"
            class="mx-1 flex flex-col flex-wrap"
          >
            {{ tagCat.categoryName }}
            <div v-for="tag of tagCat.tags" :key="tag.id">
              <UCheckbox
                v-model="tag.selected"
                color="primary"
                variant="card"
                :disabled="sending"
                class="py-1"
                @click="addTagToBeChanged(tag.id, tag.selected)"
              >
                <template #label>
                  {{ tag.name }}
                  <UBadge
                    variant="outline"
                    :color="
                      tag.selectedCount === 0
                        ? 'neutral'
                        : tag.selectedCount === selectedProducts.length
                          ? 'success'
                          : 'info'
                    "
                    class="ml-2"
                    >{{ tag.selectedCount }}/{{
                      selectedProducts.length
                    }}</UBadge
                  >
                  <UBadge
                    v-if="tagsToAdd.includes(tag.id)"
                    color="success"
                    class="ml-2"
                    ><UIcon name="i-lucide-plus"
                  /></UBadge>
                  <UBadge
                    v-if="tagsToRemove.includes(tag.id)"
                    color="error"
                    class="ml-2"
                    ><UIcon name="i-lucide-minus"
                  /></UBadge>
                </template>
              </UCheckbox>
            </div>
          </div>
        </div>
        <UButton
          type="button"
          color="info"
          class="mt-2 h-fit self-end"
          @click="updateTags()"
          >Update {{ tagsToAdd.length + tagsToRemove.length }} tags</UButton
        >
        <UButton
          type="button"
          color="info"
          variant="outline"
          class="mx-2 mt-2 h-fit self-end"
          @click="
            tagsToAdd = [];
            tagsToRemove = [];
          "
          >Clear Tag Changes</UButton
        >
      </div>
    </div>
  </div>
</template>
