<template>
  <div class="explore-view">
    <DesktopView v-if="!isMobile">
      <RouterView />
    </DesktopView>
    <MobileView v-else>
      <RouterView />
    </MobileView>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import MobileView from './MobileView.vue'
import DesktopView from './DesktopView.vue'
import { useSaintsStore } from '../stores/mode'

const store = useSaintsStore()

const isMobile = ref(false)

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
  //set default mode to places
  store.setMode('places')
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
  store.setMode('places')
})
</script>

<style scoped>
.explore-view {
    width: 100%;
    height: calc(100vh - 130px);
}
</style>