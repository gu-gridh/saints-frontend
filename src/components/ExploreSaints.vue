<template>
<ExploreFilters>
</ExploreFilters>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSaintsStore } from '@/stores/mode'
import ExploreFilters from '@/components/ExploreFilters.vue'

const store = useSaintsStore()

onMounted(() => {
    store.setMode('saints')
})
</script>