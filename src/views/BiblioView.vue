<script setup>
import { computed } from 'vue'
import { useCmsPage } from '@/composables/useCmsPage'
import BiblioList from '@/components/BiblioList.vue'

const { page, loading, error } = useCmsPage(computed(() => 'bibliography'))
</script>

<template>
    <main>
      <section v-if="page">
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
      </section>
      <p v-else-if="loading">Loading...</p>
      <p v-else-if="error">Could not load text.</p>
    
      <BiblioList />
    </main>

</template>