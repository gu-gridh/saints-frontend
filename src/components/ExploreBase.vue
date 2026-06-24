<template>
  <RouterView />
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSaintsStore } from '@/stores/mode'

const store = useSaintsStore()
const route = useRoute()
const router = useRouter()

const queryMode = computed(() => store.queryMode)

onMounted(() => {
  if (route.path === '/explore') {
    const mode = queryMode.value || 'places'
    router.push(`/explore/${mode}`)
  }
})
</script>

<style scoped>


</style>