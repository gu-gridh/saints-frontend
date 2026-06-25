<template>
  <main id="map" @mouseleave="closeTooltip">
    <div v-if="isLoading" class="spinner-overlay">
      <div class="spinner"></div>
    </div>

    <div ref="mapContainer" id="map-container"></div>

    <div
      ref="dateWidget"
      class="date-widget"
      v-show="mode !== 'places'"
    >
      <DateSlider />
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSaintsStore } from '@/stores/mode'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import DateSlider from '@/components/DateSlider.vue'
import { map as fetchMap } from '@/assets/db'
import { mapCenter as defaultMapCenter } from '@/assets/config'
import { buildMapParams, onFeatureClick } from '@/assets/query'
import { markerIcon } from '@/assets/map'

const store = useSaintsStore()
const router = useRouter()

const mapContainer = ref(null)
const dateWidget = ref(null)

const map = ref(null)
const queryLayer = ref(null)
const coordinatePopup = ref(null)
const currentZoom = ref(defaultMapCenter.zoom || 8)

const query = computed(() => store.query)
const mode = computed(() => store.mode)
const mapDateRange = computed(() => store.mapDateRange)
const mapCenter = computed(() => store.mapCenter)
const zoom = computed(() => store.zoom)
const isLoading = computed(() => store.isLoading)
const updateSize = computed(() => store.updateSize)
const refreshLayers = computed(() => store.refreshLayers)

function resizeMap() {
  requestAnimationFrame(() => {
    map.value?.invalidateSize()
  })
}
defineExpose({
  resizeMap,
})

const mapArgs = computed(() => {
  let bbox

  if (map.value) {
    const bounds = map.value.getBounds()

    bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ].join(',')
  }

  return {
    zoom: Math.ceil(currentZoom.value),
    range: mapDateRange.value?.join(','),
    bbox,
  }
})

function setLoading(value) {
  if (typeof store.setIsLoading === 'function') {
    store.setIsLoading(value)
  } else {
    store.isLoading = value
  }
}

function getMapArgs() {
  const bounds = map.value?.getBounds()?.pad(0.25)

  return {
    zoom: Math.ceil(map.value?.getZoom() || currentZoom.value),
    range: mapDateRange.value?.join(','),
    bbox: bounds
      ? [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ].join(',')
      : undefined,
  }
}

async function fetchPlacesGeoJson() {
  setLoading(true)

  try {
    const params = buildMapParams(query.value, getMapArgs())
    const response = await fetchMap(params.toString())

    if (response?.type === 'FeatureCollection') {
      return response
    }

    if (response?.results?.type === 'FeatureCollection') {
      return response.results
    }

    return {
      type: 'FeatureCollection',
      features: [],
    }
  } finally {
    setLoading(false)
  }
}

async function createQueryLayer() {
  const geojson = await fetchPlacesGeoJson()

  return L.geoJSON(geojson, {
    pointToLayer(feature, latlng) {
    return L.marker(latlng, {
      icon: markerIcon(feature, mode.value),
    })
  },

    onEachFeature(feature, leafletLayer) {
      const props = feature.properties || {}

      const title = [
        props.name,
        props.place_type_name,
      ].filter(Boolean).join(', ')

      if (title) {
        leafletLayer.bindTooltip(title, {
          direction: 'top',
          sticky: true,
        })
      }

    leafletLayer.on('click', () => {
        onFeatureClick(props, {
          router,
          mode: mode.value,
        })
    })
    },
  })
}

let rebuildId = 0

async function rebuildQueryLayer() {
  if (!map.value) return

  const currentRebuildId = ++rebuildId

  if (queryLayer.value) {
    queryLayer.value.clearLayers()
    map.value.removeLayer(queryLayer.value)
    queryLayer.value = null
  }

  const newLayer = await createQueryLayer()

  if (currentRebuildId !== rebuildId) {
    newLayer.clearLayers()
    return
  }

  queryLayer.value = newLayer
  queryLayer.value.addTo(map.value)
}

function handleMapClick(event) {
  const { lat, lng } = event.latlng

  coordinatePopup.value = L.popup()
    .setLatLng(event.latlng)
    .setContent(`
      <span class="mr-1">${lng.toFixed(4)}</span>
      <span>${lat.toFixed(4)}</span>
    `)
    .openOn(map.value)
}

function closeTooltip() {
  if (!map.value) return
  map.value.getContainer().style.cursor = 'grab'
}

function addVueWidgetToMap(element, position = 'bottomleft') {
  const Control = L.Control.extend({
    onAdd() {
      L.DomEvent.disableClickPropagation(element)
      L.DomEvent.disableScrollPropagation(element)
      return element
    },
  })

  new Control({ position }).addTo(map.value)
}

async function initMap() {
  await nextTick()

  map.value = L.map(mapContainer.value, {
    center: [defaultMapCenter.lat, defaultMapCenter.lon],
    zoom: defaultMapCenter.zoom,
    zoomControl: true,
  })

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map.value)

  map.value.on('click', handleMapClick)

  map.value.on('zoomend', () => {
    currentZoom.value = map.value.getZoom()
  })

  if (dateWidget.value) {
    addVueWidgetToMap(dateWidget.value, 'bottomleft')
  }

  await rebuildQueryLayer()
}

watch(
  query,
  async () => {
    await rebuildQueryLayer()
  },
  { deep: true }
)

watch(zoom, newZoom => {
  if (!map.value || !newZoom) return

  map.value.setZoom(newZoom, {
    animate: true,
  })
})

watch(mapCenter, value => {
  if (!value) return

  if (Array.isArray(value)) {
    const [lon, lat] = value
    centerMap(lon, lat)
    return
  }

  if (value.lon && value.lat) {
    centerMap(value.lon, value.lat)
  }
})

watch(updateSize, () => {
  if (!map.value) return

  nextTick(() => {
    map.value.invalidateSize()
  })
})

watch(refreshLayers, async () => {
  await rebuildQueryLayer()
})

watch(
  mapArgs,
  async () => {
    await rebuildQueryLayer()
  },
  { deep: true }
)

watch(
  mode,
  async () => {
    await rebuildQueryLayer()
  }
)

onMounted(async () => {
  await initMap()
  setTimeout(() => {
    map.value?.invalidateSize()
  }, 100)
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>

<style scoped>
main {
  position: relative;
  flex: 1;
  font-size: 0.8rem;
  width: 100%;
  height: 100%;
}

#map-container {
  width: 100%;
  height: 100%;
  border-radius: 20px 0 0 20px;
  background-color: #e8f5fe;
  z-index: 40;
}

.spinner-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.date-widget {
  padding: 0.2rem 1rem 0.2rem 0;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 0.5rem;
  font-size: 18px;
}

:deep(.leaflet-control-zoom-in),
:deep(.leaflet-control-zoom-out) {
  line-height: 1;
  font-size: 25px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 35px;
  height: 35px;
}

:deep(.leaflet-control-zoom-in:hover),
:deep(.leaflet-control-zoom-out:hover) {
  background-color: rgba(0, 0, 0, 0.9);
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

.spinner::after {
  content: "";
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  margin-top: -20px;
  margin-left: -20px;
  border-radius: 50%;
  border: 5px solid rgba(180, 180, 180, 0.6);
  border-top-color: rgba(0, 0, 0, 0.6);
  animation: spinner 0.6s linear infinite;
}

.leaflet-shape-icon {
  background: transparent;
  border: none;
}
</style>