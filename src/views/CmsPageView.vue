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

const slug = computed(() => props.slug)

const { page, loading, error } = useCmsPage(slug)
</script>

<template>
  <main>
    <div v-if="loading">
      Loading...
    </div>

    <div v-else-if="error">
      Could not load page.
    </div>

    <template v-else-if="page">
      <div v-if="page.show_banner" id="hero"></div>

      <h1>{{ page.title }}</h1>

      <template v-for="block in page.body || []" :key="block.id">
        <h2 v-if="block.type === 'heading'">
          {{ block.value }}
        </h2>

        <div
          v-else-if="block.type === 'text'"
          v-html="block.value"
        />
      </template>
    </template>
  </main>
</template>

