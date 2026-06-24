// src/stores/mode.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInitialQueryState } from '@/assets/query'

export const useSaintsStore = defineStore('saints', () => {
    const initialQueryState = getInitialQueryState()
    const mode = ref(initialQueryState.mode)
    const query = ref(initialQueryState)
    const mapDateRange = ref(null)
    const mapCenter = ref(null)
    const zoom = ref(null)
    const isLoading = ref(false)
    const updateSize = ref(0)
    const refreshLayers = ref(0)

    function setMode(nextMode) {
      mode.value = nextMode
      query.value.mode = nextMode
    }

    function setIsLoading(value) {
      isLoading.value = value
    }

    function bumpUpdateSize() {
      updateSize.value += 1
    }

    function bumpRefreshLayers() {
      refreshLayers.value += 1
    }

    return {
      mode,
      query,
      mapDateRange,
      mapCenter,
      zoom,
      isLoading,
      updateSize,
      refreshLayers,
      setMode,
      setIsLoading,
      bumpUpdateSize,
      bumpRefreshLayers,
    }
})

