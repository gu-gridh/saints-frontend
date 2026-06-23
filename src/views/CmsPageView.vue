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
      <div v-if="page.show_banner" id="hero"></div>
      <h1>{{ page.title }}</h1>
  
      <template v-for="block in page.body" :key="block.id">
        <h2 v-if="block.type === 'heading'">
          {{ block.value }}
        </h2>
  
        <div
          v-else-if="block.type === 'text'"
          v-html="block.value"
        />
      </template>
    </main>
  </template>

