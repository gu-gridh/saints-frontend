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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import MobileView from './MobileView.vue'
import DesktopView from './DesktopView.vue'
import { useSaintsStore } from '../stores/mode'

const store = useSaintsStore()
const route = useRoute()

const isMobile = ref(false)

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

watch(
  () => route.name,
  name => {
    if (['places', 'place'].includes(name)) store.setMode('places')
    if (['saints', 'saint'].includes(name)) store.setMode('saints')
    if (['cults', 'cult'].includes(name)) store.setMode('cults')
    if (['people', 'person'].includes(name)) store.setMode('people')
  },
  { immediate: true }
)

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})
</script>

<style scoped>
.explore-view {
    width: 100%;
    height: calc(100vh - 130px);
}
</style>