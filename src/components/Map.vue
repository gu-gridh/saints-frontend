<template>
  <main id="map" @mouseleave="closeTooltip">
    <div v-if="isLoading" class="spinner-overlay">
      <div class="spinner"></div>
    </div>

    <div ref="mapContainer" id="map-container"></div>
    <div
      ref="legendWidget"
      class="layer-ctrl"
      @mouseenter="showLegend"
      @mouseleave="hideLegend"
      v-show="mode === 'places'"
    >

      <button
        v-if="legendSmall"
        class="layer-switcher-button"
        type="button"
        aria-label="Show legend"
      ></button>

      <div v-else class="map-legend">
        <h6>Legend</h6>
        <div v-for="icon in legendIcons" :key="icon.label" class="legend-row">
          <span v-html="legendShape(icon)" class="svg-icon"></span>
          <span class="legend-name">{{ icon.label }}</span>
        </div>
      </div>
    </div>

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

const legendWidget = ref(null)
const legendSmall = ref(true)

let legendHideTimer = null

function showLegend() {
  clearTimeout(legendHideTimer)
  legendSmall.value = false
}

function hideLegend() {
  clearTimeout(legendHideTimer)
  legendHideTimer = setTimeout(() => {
    legendSmall.value = true
  }, 1000)
}

const legendColors = {
  orange: 'rgba(255, 128, 0, .6)',
  red: 'rgba(255, 0, 0, .5)',
  purple: 'rgba(160, 39, 136, .8)',
  blue: 'rgba(11, 56, 161, .7)',
  brown: '#a0735f99',
}

const legendIcons = [
  { label: 'City', color: 'blue', shape: 'square' },
  { label: 'Town', color: 'blue', shape: 'circle' },
  { label: 'Cathedral', color: 'purple', shape: 'triangle' },
  { label: 'Episcopal entity', color: 'purple', shape: 'square' },
  { label: 'Secular territorial entity', color: 'brown', shape: 'square' },
  { label: 'Parish church', color: 'red', shape: 'triangle' },
  { label: 'Religious house', color: 'red', shape: 'circle' },
  { label: 'Other church', color: 'red', shape: 'triangle' },
  { label: 'Castle', color: 'blue', shape: 'star' },
  { label: 'Devotional site', color: 'orange', shape: 'circle' },
  { label: 'Other rural site', color: 'brown', shape: 'triangleDown' },
  { label: 'Other urban site', color: 'orange', shape: 'triangleDown' },
]

function legendColor(color) {
  return legendColors[color] || color
}

function legendShape(icon) {
  const color = legendColor(icon.color)

  if (icon.shape === 'square') {
    return `<svg viewBox="0 0 20 20"><rect width="14" height="14" x="3" y="3" fill="${color}" /></svg>`
  }

  if (icon.shape === 'circle') {
    return `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="${color}" /></svg>`
  }

  if (icon.shape === 'triangle') {
    return `<svg viewBox="0 0 20 20"><polygon points="10,2 2,18 18,18" fill="${color}" /></svg>`
  }

  if (icon.shape === 'triangleDown') {
    return `<svg viewBox="0 0 20 20"><polygon points="2,2 18,2 10,18" fill="${color}" /></svg>`
  }

  if (icon.shape === 'star') {
    return `<svg viewBox="0 0 20 20"><polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill="${color}" /></svg>`
  }

  return ''
}

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

function getSelectedMarkerIds() {
  if (mode.value === 'saints') {
    return store.query.saints.saints || []
  }

  if (mode.value === 'people') {
    return store.query.people.people || []
  }

  if (mode.value === 'cults') {
    return (
      store.query.cults.filterType?.length
        ? store.query.cults.filterType
        : store.query.cults.types?.length
          ? store.query.cults.types
          : store.query.cults.areas?.length
            ? store.query.cults.areas
            : []
    )
  }

  return []
}

async function createQueryLayer() {
  const geojson = await fetchPlacesGeoJson()

  return L.geoJSON(geojson, {
    pointToLayer(feature, latlng) {

    const selectedIds =
      mode.value === 'saints'
        ? store.query.saints.saints
        : mode.value === 'people'
          ? store.query.people.people
          : mode.value === 'cults'
            ? store.query.cults.types
            : []
    return L.marker(latlng, {
      icon: markerIcon(feature, mode.value, getSelectedMarkerIds()),
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
  if (legendWidget.value) {
    addVueWidgetToMap(legendWidget.value, 'bottomright')
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

function centerMap(lon, lat) {
  if (!map.value) return
  map.value.setView([lat, lon], map.value.getZoom(), {
    animate: true,
  })
}

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

.layer-ctrl {
  background: transparent;
}

.layer-switcher-button {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  background-color: rgba(236, 211, 211, 0.7);
  background-image: url('@/assets/icons/info_black.png');
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
}

.map-legend {
  background: rgba(255, 255, 255, 0.9);
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 13px;
  max-height: 45vh;
  overflow: auto;
}

.map-legend h6 {
  margin: 0 0 0.5rem;
  font-size: 14px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.2rem;
}

.svg-icon {
  width: 1.5em;
  height: 1.5em;
  display: inline-flex;
}

.svg-icon svg {
  width: 1.5em;
  height: 1.5em;
}

.legend-name {
  white-space: nowrap;
}
</style>