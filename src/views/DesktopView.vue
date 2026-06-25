<template>
  <splitpanes class="default-theme" @resized="onPaneResized">
    <pane :size="50">
      <Map ref="mapRef" />
    </pane>

    <pane :size="50" class="explore-pane">
      <!-- <ExploreMenu /> -->
      <slot />
    </pane>
  </splitpanes>
</template>

<script setup>
import { ref } from 'vue'
import Map from '@/components/Map.vue'
import ExploreMenu from '@/components/ExploreMenu.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

const mapRef = ref(null)

function onPaneResized() {
  mapRef.value?.resizeMap()
}
</script>

<style scoped>
.explore-pane {
  padding: 1rem;
  overflow: auto;
}
</style>