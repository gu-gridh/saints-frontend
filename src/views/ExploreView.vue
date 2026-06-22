<template>
    <div class="explore-view">
        <DesktopView v-if="!isMobile"/>
        <MobileView v-else/>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import MobileView from './MobileView.vue'
import DesktopView from './DesktopView.vue'

const isMobile = ref(false)

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

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