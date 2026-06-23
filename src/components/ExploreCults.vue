<template>

</template>

<script setup>
import { onMounted } from 'vue'
import { useSaintsStore } from '@/stores/mode'

const store = useSaintsStore()

onMounted(() => {
    store.mode = 'cults'
})
</script>