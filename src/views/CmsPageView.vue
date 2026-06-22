<script setup>
import { computed } from 'vue'
import { useCmsPage } from '@/composables/useCmsPage'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { page, loading, error } = useCmsPage(computed(() => props.slug))
</script>

<template>
    <main>
      <h1>{{ page.title }}</h1>
  
      <template v-for="block in page.body" :key="block.id">
        <h2 v-if="block.type === 'heading'">
          {{ block.value }}
        </h2>
  
        <div
          v-else-if="block.type === 'text'"
          v-html="block.value"
        />
  
        <img
          v-else-if="block.type === 'image'"
          :src="block.value.meta.download_url"
          :alt="block.value.title"
        />
      </template>
    </main>
  </template>

