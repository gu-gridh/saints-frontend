<template>
  <div class="mt-3" v-if="records.length">
    <span>{{ title }}</span>

    <ImageView
      class="mt-3"
      :records="records"
      :tbl="tb"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import ImageView from "@/components/ImageView.vue";

const props = defineProps({
  obj: {
    type: Array,
    default: () => [],
  },
  tb: {
    type: String,
    required: true,
  },
});

const records = computed(() => props.obj ?? []);

const title = computed(() => {
  if (props.tb === "shm_art") {
    return "Images from the Collection Medeltidens bildvärld";
  }

  if (props.tb === "iconographic") {
    return "Cult manifestations in Iconographic card";
  }

  return "Images";
});
</script>