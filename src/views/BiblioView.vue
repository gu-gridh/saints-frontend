<script setup>
import { computed } from 'vue'
import { useCmsPage } from '@/composables/useCmsPage'
import CmsContent from '@/components/CmsContent.vue'
import BiblioList from '@/components/BiblioList.vue'

const { page, loading, error } = useCmsPage(computed(() => 'sources'))
</script>

<template>
    <main>
      <CmsContent v-if="page" :page="page" />
  
      <p v-else-if="loading">Loading...</p>
      <p v-else-if="error">Could not load text.</p>
  
      <BiblioList />
    </main>
</template>