import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInitialQueryState } from '@/assets/query'

export const useSaintsStore = defineStore('saints', () => {
  const initialQueryState = getInitialQueryState()

  const mode = ref(initialQueryState.mode)
  const query = ref(initialQueryState)

  const mapDateRange = ref(null)
  const searchDateRange = ref(null)

  const isLoading = ref(false)
  const updateSize = ref(0)
  const refreshLayers = ref(0)
  const visualObj = ref(null)
  const START_CENTER = [59.8996, 17.6322]
  const START_ZOOM = 8

  const mapCenter = ref(START_CENTER)
  const zoom = ref(START_ZOOM)

  function resetMapView() {
    mapCenter.value = START_CENTER
    zoom.value = START_ZOOM
  }

  function setVisualObj(value) {
    visualObj.value = value
  }
  

  function bumpUpdateSize() {
    updateSize.value += 1
  }

  function bumpRefreshLayers() {
    refreshLayers.value += 1
  }

  function setMode(nextMode) {
    mode.value = nextMode
    query.value.mode = nextMode
    bumpRefreshLayers()
  }

  function setIsLoading(value) {
    isLoading.value = value
  }

  function setMapDateRange(value) {
    mapDateRange.value = value
    bumpRefreshLayers()
  }

  function setSearchDateRange(value) {
    searchDateRange.value = value
    bumpRefreshLayers()
  }

  function setMapCenter(value) {
    mapCenter.value = value
  }

  function setZoom(value) {
    zoom.value = value
  }

  // places
  function setPlacesTypes(value) {
    query.value.places.types = value
    bumpRefreshLayers()
  }

  function setPlaceType2(value) {
    query.value.places.placeTypes = value
    bumpRefreshLayers()
  }

  function setDioceseTypes2(value) {
    query.value.places.diocese = value
    bumpRefreshLayers()
  }

  // saints
  function setSaintsSex(value) {
    query.value.saints.sex = value || 'all'
    bumpRefreshLayers()
  }

  function setSaintsTypes(value) {
    query.value.saints.types = value
    bumpRefreshLayers()
  }

  function setSaints(value) {
    query.value.saints.saints = value
    bumpRefreshLayers()
  }

  // people
  function setPeopleSex(value) {
    query.value.people.sex = value || 'all'
    bumpRefreshLayers()
  }

  function setPeopleTypes(value) {
    query.value.people.types = value
    bumpRefreshLayers()
  }

  function setPeople(value) {
    query.value.people.people = value
    bumpRefreshLayers()
  }

  // cults
  function setAreaTypes(value) {
    query.value.cults.areas = value
    query.value.cults.types = []
    query.value.cults.filterType = []
    bumpRefreshLayers()
  }

  function setCultsTypes(value) {
    query.value.cults.types = value
    query.value.cults.filterType = []
    bumpRefreshLayers()
  }

  function setFilterTypes(value) {
    query.value.cults.filterType = value
    bumpRefreshLayers()
  }

  function setDioceseTypes(value) {
    query.value.cults.dioceseState = value
    bumpRefreshLayers()
  }

  function setExtant(value) {
    query.value.cults.extant = value
    bumpRefreshLayers()
  }

  function clearCults() {
    query.value.cults.types = []
    query.value.cults.areas = []
    query.value.cults.filterType = []
    query.value.cults.dioceseState = null
    query.value.cults.extant = null
    bumpRefreshLayers()
  }

      function resetMode(modeName) {
      const initial = getInitialQueryState()

      query.value[modeName] = structuredClone(initial[modeName])

      if (mode.value === modeName) {
        bumpRefreshLayers()
      }
    }

  function getSelectedMarkerIds() {
    if (mode.value === 'saints') {
      return query.value.saints.saints || []
    }

    if (mode.value === 'people') {
      return query.value.people.people || []
    }

    if (mode.value === 'cults') {
      if (query.value.cults.filterType?.length) {
        return query.value.cults.filterType
      }

      if (query.value.cults.types?.length) {
        return query.value.cults.types
      }

      if (query.value.cults.areas?.length) {
        return query.value.cults.areas
      }
    }

    return []
  }

  //advanced search
  function setAdvancedSearch(value) {
    query.value.advanced = {
      ...query.value.advanced,
      ...value,
    }
    setMode('advanced')
    bumpRefreshLayers()
  }

  function clearAdvancedSearch() {
    query.value.advanced = {
      cultType: [],
      placeType: [],
      personType: [],
      placeTypes: [],
      personName: [],
      dioceseState: null,
    }

    if (mode.value === 'advanced') {
      bumpRefreshLayers()
    }
  }

  return {
    mode,
    query,
    mapDateRange,
    searchDateRange,
    mapCenter,
    zoom,
    isLoading,
    updateSize,
    refreshLayers,

    setMode,
    setIsLoading,
    setMapDateRange,
    setSearchDateRange,
    setMapCenter,
    setZoom,
    bumpUpdateSize,
    bumpRefreshLayers,

    setPlacesTypes,
    setPlaceType2,
    setDioceseTypes2,

    setSaintsSex,
    setSaintsTypes,
    setSaints,

    setPeopleSex,
    setPeopleTypes,
    setPeople,

    setAreaTypes,
    setCultsTypes,
    setFilterTypes,
    setDioceseTypes,
    setExtant,
    clearCults,

    getSelectedMarkerIds,

    resetMode,
    setAdvancedSearch,
    clearAdvancedSearch,
    visualObj,
    setVisualObj,

    resetMapView,
  }
})