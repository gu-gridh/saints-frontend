// src/stores/mode.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mapCenter as defaultMapCenter } from '@/assets/config'

export const useSaintsStore = defineStore('saints', () => {
  const mapCenter = ref([
    defaultMapCenter.lon,
    defaultMapCenter.lat,
    defaultMapCenter.zoom,
  ])

  const mapDateRange = ref(null)
  const updateSize = ref(0)
  const refreshLayers = ref(0)
  const layersVisible = ref({})
  const showParams = ref(null)
  const showObj = ref(null)
  const dynamicLayers = ref([])
  const visualObj = ref(null)
  const showAdvanced = ref(false)
  const searchDateRange = ref(null)
  const zoom = ref(8)
  const newZoom = ref(null)
  const isLoading = ref(false)
  const mode = ref('places')

  function centerMap(value) {
    mapCenter.value = value
  }

  function zoomMap(value) {
    zoom.value = value
  }

  function setMapDateRange(range) {
    mapDateRange.value = range ? [...range] : null
  }

  function setSearchDateRange(range) {
    searchDateRange.value = range ? [...range] : null
  }

  function triggerUpdateSize() {
    updateSize.value = Date.now()
  }

  function triggerRefreshLayers() {
    refreshLayers.value = Date.now()
  }

  function showLayers(layers) {
    Object.keys(layers).forEach(name => {
      layersVisible.value[name] = !!layers[name]
    })
  }

  function addLayer(layer) {
    const layerWithName = {
      ...layer,
      name: `${layer.tb}#${layer.id}`,
    }

    layersVisible.value[layerWithName.name] = true

    if (!dynamicLayers.value.find(({ name }) => name === layerWithName.name)) {
      dynamicLayers.value.push(layerWithName)
    }
  }

  function removeLayer(layerName) {
    dynamicLayers.value = dynamicLayers.value.filter(
      ({ name }) => name !== layerName
    )

    showLayers({ [layerName]: false })
  }

  function show({ tb, id }) {
    showParams.value = { tb, id }
  }

  function showLoaded(record) {
    showObj.value = record
  }

  function showVisual(id) {
    visualObj.value = id
  }

  function setShowAdvanced(value) {
    showAdvanced.value = value
  }

  function setIsLoading(value) {
    isLoading.value = value
  }

  return {
    mapCenter,
    mapDateRange,
    updateSize,
    refreshLayers,
    layersVisible,
    showParams,
    showObj,
    dynamicLayers,
    visualObj,
    showAdvanced,
    searchDateRange,
    zoom,
    newZoom,
    isLoading,
    mode,

    centerMap,
    zoomMap,
    setMapDateRange,
    setSearchDateRange,
    triggerUpdateSize,
    triggerRefreshLayers,
    showLayers,
    addLayer,
    removeLayer,
    show,
    showLoaded,
    showVisual,
    setShowAdvanced,
    setIsLoading,
  }
})


