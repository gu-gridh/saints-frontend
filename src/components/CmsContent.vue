<template>
  <article class="info-article"
    :class="{
      'content-half': page.content_width === 'half',
      'content-full': page.content_width === 'full',
    }"
  >
    <div v-if="page.show_banner" id="hero"></div>

    <h1 :class="{ home: homeHeading }">
      {{ page.title }}
    </h1>

    <template v-for="block in page.body" :key="block.id">
      <h2 v-if="block.type === 'heading'"
      :class="{ home: homeHeading }">
        {{ block.value }}
      </h2>

      <div
        v-else-if="block.type === 'text'"
        class="rich-text"
        :class="{ columns: block.value.two_columns }"
        v-html="block.value.text"
      />

      <CultTypeTable
        v-else-if="block.type === 'culttype_table'"
      />
    </template>
  </article>
</template>

<script setup>
import CultTypeTable from '@/components/CultTypeTable.vue'

const props = defineProps({
  page: {
    type: Object,
    required: true,
  },
  homeHeading: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>

@media (min-width: 1024px) {
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

  .columns {
    margin-top: 20px;
    columns: 2;
    column-gap: 4rem;
    text-align: justify;
  }

  .columns :deep(blockquote) {
    padding-left: 2rem;
    margin-bottom: 1rem;
    break-before: avoid;
    break-inside: avoid-column;
  }

  .columns :deep(p:has(+ blockquote)) {
    break-after: avoid;
  }

  .content-half {
    max-width: 50%;
  }
}

h1.home {
  font-family: 'Antic Didone', serif;
  font-style: normal;
  font-weight: 100;
  padding: 0 0 0 0;
  font-size: 150px;
  line-height: .86;
  margin-bottom: 10px;
  width: 550px;
  letter-spacing: -5px;
}

h2.home {
  margin-bottom: 0px;
}

h2 {
  margin-top: 2rem;
  color: inherit;
}

:deep(h3) {
  padding: 0;
}

:deep(hr) {
  padding: 2rem 0 1rem 0;
  border: none;
  border-top: 0.5px solid var(--contrast-grey);
}

:deep(a) {
  color: var(--link-color);
  text-decoration: none;
}

:deep(ul) {
  margin-bottom: 1rem;
}

.rich-text :deep(.richtext-arrow-link) {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: black;
  padding: 0.5em;
  border-radius: 0.3em;
  font-size: larger;
  font-weight: 400;
}

.rich-text :deep(.richtext-arrow-link::before) {
  content: '';
  background-image: url(../assets/icons/linkbutton.svg);
  display: inline-block;
  width: 32px;
  height: 32px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

:deep(p:has(.richtext-arrow-link)) {
  margin-bottom: 0;
}

:deep(p:has(.richtext-arrow-link):hover) {
  margin-bottom: 0;
  background-color: #ffffff;
  width: 50%;
  border-radius: 0.3em;
}
</style>