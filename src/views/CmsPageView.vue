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
    <main  v-if="page">
      <div v-if="page.show_banner" id="hero"></div>
      <h1 :class="{ home: props.slug === 'home' }">{{ page.title }}</h1>
  
      <template v-for="block in page.body" :key="block.id">
        <h2 v-if="block.type === 'heading'">
          {{ block.value }}
        </h2>
  
        <div
          v-else-if="block.type === 'text'"
          :class="{ columns: block.value.two_columns }"
          v-html="block.value.text"></div>
      </template>      
    </main>
    <p v-else-if="loading">Loading...</p>
    <p v-else-if="error">Could not load text.</p>
</template>

<style scoped>

#hero {
  pointer-events: none;
  position: absolute;
  overflow: hidden;
  width: 600px;
  height: 1100px;
  background-image: url(../assets/img/hero.png);
  background-size: cover;
  right: -200px;
  top: -500px;
  z-index: 0;
  transition: all 0.2s ease-in-out;
  transform: rotate(-55deg);
}

.columns{
  margin-top:20px;
  margin-bottom:40px;
  columns:2;
  column-gap: 40px;
  text-align:justify;
}

</style>