<script setup>
import { computed } from 'vue'
import { useCmsPage } from '@/composables/useCmsPage'
import CmsContent from '@/components/CmsContent.vue'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { page, loading, error } = useCmsPage(computed(() => props.slug))
</script>

<template>
  <main v-if="page">
    <CmsContent
      :page="page"
      :home-heading="props.slug === 'home'"
    />
  </main>

  <p v-else-if="loading">Loading...</p>
  <p v-else-if="error">Could not load text.</p>
</template>