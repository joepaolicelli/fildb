<script setup lang="ts">
import { useMutation } from '@pinia/colada';
import type { QueryData } from '@supabase/supabase-js';
import { objectToSnake } from 'ts-case-convert';
import type { CamelCasedPropertiesDeep } from 'type-fest';

import { useTags } from '~/queries/tags';

const supabase = useSupabaseClient();
const statusToaster = new StatusToaster('Filament Tags');

// Just used for type for prop.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const productWithTagsQuery = supabase
  .from('products')
  .select(
    `
      *,
      filaments(*),
      tags(*)
    `,
  )
  .limit(1)
  .single();

const props = defineProps<{
  product: CamelCasedPropertiesDeep<QueryData<typeof productWithTagsQuery>>;
}>();
const emit = defineEmits(['refetch']);

const { tags } = useTags();

const availableTagsByCategory: Ref<
  ReturnType<typeof getTagsForProductTypeByCategory>
> = ref([]);

watch(
  [() => props.product, () => tags.value.data],
  () => {
    availableTagsByCategory.value = getTagsForProductTypeByCategory(
      tags.value.data ?? [],
      props.product.type,
    );
    for (const tagCat of availableTagsByCategory.value) {
      if (tagCat.tags) {
        for (const tag of tagCat.tags) {
          if (props.product.tags.map((t) => t.id).includes(tag.id)) {
            tag.selected = true;
          }
        }
      }
    }

    statusToaster.updateContext(`Filament Tags: ${props.product.name}`);
  },
  { immediate: true },
);

const sending = ref(false);

const { mutate: updateTags } = useMutation({
  mutation: async () => {
    sending.value = true;

    const selectedTags = availableTagsByCategory.value
      .map((tc) => tc.tags)
      .flat()
      .filter((t) => t != null && t.selected);

    const currentTagIds = props.product.tags.map((tag) => tag.id);
    const toAdd = selectedTags.filter(
      (tag) => tag != null && !currentTagIds.includes(tag.id),
    );
    const toRemove = props.product.tags.filter(
      (tag) => !selectedTags.map((t) => t?.id).includes(tag.id),
    );

    let toAddErrored = false;
    if (toAdd.length > 0) {
      const { error } = await supabase.from('product_tags').insert(
        toAdd
          .filter((t) => t != null)
          .map((tag) =>
            objectToSnake({
              productId: props.product.id,
              tagId: tag.id,
            }),
          ),
      );

      if (error) {
        statusToaster.error('Update Failed!', error.message);
        console.log(error);
        toAddErrored = true;
      } else {
        statusToaster.success('Updated!');
      }
    }

    if (!toAddErrored && toRemove.length > 0) {
      const { error } = await supabase
        .from('product_tags')
        .delete()
        .eq('product_id', props.product.id)
        .in(
          'tag_id',
          toRemove.map((t) => t.id),
        );

      if (error) {
        statusToaster.error('Update Failed!', error.message);
        console.log(error);
      } else {
        statusToaster.success('Updated!');
      }
    }
    sending.value = false;
  },
  onSettled: async () => emit('refetch'),
});
</script>
<template>
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
            :label="tag.name"
            :disabled="sending"
            class="py-1"
          />
        </div>
      </div>
    </div>
    <UButton
      type="button"
      color="info"
      class="h-fit self-end"
      @click="updateTags()"
      >Update</UButton
    >
  </div>
</template>
