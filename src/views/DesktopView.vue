<template>
  <div class="split-container">
    <splitpanes class="" @resized="onPaneResized">
      <pane :size="50">
        <Map ref="mapRef" />
      </pane>
      <pane :size="50" class="explore-pane">
        <slot />
      </pane>
    </splitpanes>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Map from '@/components/Map.vue'
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
  background-color: white;
}

.split-container {
  height: 90vh;   
  margin: 16px;
  border-radius: 16px;
  overflow: hidden; 
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.splitpanes {
  height: 100%;
}

.explore-pane {
  padding: 1rem;
  overflow: auto;
  background: white;
}

</style>