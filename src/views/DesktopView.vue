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
  padding: 1rem 2rem;
  overflow: auto;
  background-color: white;
}

.split-container {
  height: 90vh;   
  border-radius: 16px;
  overflow: hidden; 
  box-shadow: 0 0 2rem rgba(0, 0, 0, .3);
}

.splitpanes {
  height: 100%;
  border-radius: 20px;
  
}

:deep(.splitpanes__splitter) {
  position: relative;
  background: transparent;
  width: 1px;
  overflow: visible;
  cursor: col-resize;
}

:deep(.splitpanes__splitter::before) {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -15px;
  margin-top: -15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: orange;
  background-image: url('@/assets/icons/slide.png');
  z-index: 1000;
  background-size: 22px 22px;
  background-repeat: no-repeat;
  background-position: center;
  box-shadow: 0 0 .5rem rgba(0, 0, 0, .3);
}


</style>