<template>
  <splitpanes
    class="default-theme"
    @resized="onPaneResized"
  >
    <pane :size="50">
      <Map ref="mapRef" />
    </pane>

    <pane :size="50">
      <ExplorePlaces />
    </pane>
  </splitpanes>
</template>

<script setup>
import { ref } from 'vue'
import Map from '@/components/Map.vue'
import ExplorePlaces from '@/components/ExplorePlaces.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

const mapRef = ref(null)

function onPaneResized() {
  mapRef.value?.resizeMap()
}
</script>