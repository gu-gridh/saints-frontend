<script setup>
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
        :class="{ columns: block.value.two_columns }"
        v-html="block.value.text"
      />
    </template>
  </article>
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

.columns {
  margin-top:20px;
  margin-bottom:40px;
  columns:2;
  column-gap: 40px;
  text-align:justify;
}

.content-half , h2.home {
  max-width: 50%;
}

</style>