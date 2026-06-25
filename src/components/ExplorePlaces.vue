<template>
  <ExploreFilters>
    <h4>Filter by type</h4>
    <TagBar :tags="types" v-model="typesSelected" />

    <div v-show="typesSelected.length !== 0">
      <h4>Type of place (max 4)</h4>
      <TagBar
        :tags="placeTypes"
        v-model="placeTypesSelected"
        :max="4"
        :key="componentKey"
      />
    </div>

    <label for="diocese">
      <h4>Filter by Medieval Diocese</h4>
    </label>

    <select v-model="diocesesSelected" class="dropdown" name="diocese">
      <option value="">All dioceses</option>
      <option
        v-for="diocese in dioceseTypes"
        :key="diocese.id"
        :value="diocese.id"
      >
        {{ diocese.name }}
      </option>
    </select>

    <button @click="clearAll" class="clearbtn">Clear search</button>

    <FreetextInput v-model="freetext" placeholder="Search by place name" />

    <span class="option-count">{{ placesNum }} items</span>

    <OptionList
      class="search-results"
      :options="placesOptions"
      :max="0"
      @input="onPlaceSelected"
    />

    <div v-if="placesNum > max" class="my-2 nav">
      <button class="frmbtn" :disabled="page <= 1" @click="goBack">←</button>

      <span>Page {{ page }} of {{ totalPages }} ({{ placesNum }} items)</span>

      <button class="frmbtn" :disabled="page >= totalPages" @click="loadMore">
        →
      </button>
    </div>
  </ExploreFilters>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getFilterTypes, miniSearch, get } from '@/assets/db'
import { useSaintsStore } from '@/stores/mode'

import ExploreFilters from './ExploreFilters.vue'
import TagBar from '@/components/TagBar.vue'
import OptionList from '@/components/OptionList.vue'
import FreetextInput from '@/components/FreetextInput.vue'

const router = useRouter()
const store = useSaintsStore()

const max = 200

const types = ref([])
const typesSelected = ref([])
const freetext = ref('')
const places = ref([])
const placesNum = ref(0)

const placeTypes = ref([])
const placeTypesSelected = ref([])
const componentKey = ref(0)

const page = ref(1)
const totalPages = ref(0)

const diocesesSelected = ref('')
const dioceseTypes = ref([])

const placesOptions = computed(() => {
  return places.value.map(place => ({
    key: place.id,
    id: place.id,
    label: [
      place.name,
      place.municipality,
      place.place_type?.name,
    ].filter(Boolean).join(', '),
  }))
})

async function load() {
  store.setMode?.('places')

  const result = await getFilterTypes('placetype', '?level=Place Type')
  types.value = result?.results || result?.data?.results || []

  const dioceseResponse = await get('diocese', {
    search: '',
    mini: '',
    type: 'Medival',
    })

  dioceseTypes.value = dioceseResponse?.results || []

  await searchPlaces()
}

async function getFilterTypes2() {
  if (!typesSelected.value.length) {
    placeTypes.value = []
    placeTypesSelected.value = []
    return
  }

  const result = await getFilterTypes(
    'placetype',
    `?parent=${typesSelected.value.join(',')}`
  )

  placeTypes.value = result?.results || result?.data?.results || []
  componentKey.value += 1
}

async function searchPlaces() {
  const query = {
    search: freetext.value,
    mini: '',
    page: page.value,
    med_diocese: diocesesSelected.value,
  }

  if (placeTypesSelected.value.length) {
    query.type = placeTypesSelected.value.join(',')
  } else if (typesSelected.value.length) {
    query.type = typesSelected.value.join(',')
  }

  const result = await get('place', query)

  places.value = result?.results || []
  placesNum.value = result?.count || 0
  totalPages.value = Math.ceil(placesNum.value / max)
}

function onPlaceSelected(selected) {
  const id = Array.isArray(selected) ? selected[selected.length - 1] : selected

  if (id) {
    router.push(`/explore/places/${id}`)
  }
}

function clearAll() {
  typesSelected.value = []
  placeTypesSelected.value = []
  diocesesSelected.value = ''
  freetext.value = ''
  page.value = 1
  componentKey.value += 1

  searchPlaces()
}

function loadMore() {
  page.value += 1
  searchPlaces()

  document
    .getElementsByClassName('option-count')?.[0]
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function goBack() {
  page.value -= 1
  searchPlaces()
}

watch(typesSelected, async value => {
  page.value = 1

  store.setPlacesTypes?.(value)
  store.query.places.types = value

  await getFilterTypes2()
  await searchPlaces()
})

watch(placeTypesSelected, async value => {
  page.value = 1

  store.setPlaceType2?.(value)
  store.query.places.placeTypes = value

  await searchPlaces()
})

watch(diocesesSelected, async value => {
  page.value = 1

  store.setDioceseTypes2?.(value)
  store.query.places.diocese = value

  await searchPlaces()
})

watch(freetext, async () => {
  page.value = 1
  await searchPlaces()
})

onMounted(load)
</script>

<style>
.too-many {
  margin-block: 0.5em;
  font-style: italic;
  font-size: smaller;
}

.search-results {
  columns: 2;
}

.dropdown {
  display: block;
  padding: 0.3em;
  border: 1px solid #ccc;
  border-radius: 0.3em;
  font-size: 90%;
  background-color: #f8f8f8;
  transition: all ease-in-out 200ms;
  width: 25%;
  padding-bottom: 10px;
}

.clearbtn {
  padding: 0 0.5em;
  border: 0;
  border-radius: 0.3em;
  font-size: 90%;
  background-color: #e8e8e8;
  transition: all ease-in-out 200ms;
  float: right;
  margin-bottom: 10px;
  color: black;
}

.moreBtn {
  padding: 0 0.5em;
  border: 0;
  border-radius: 0.3em;
  font-size: 90%;
  background-color: #e8e8e8;
  transition: all ease-in-out 200ms;
  float: right;
  margin-bottom: 10px;
  color: black;
  cursor: pointer;
}

.option-count {
  display: grid;
  padding: 0.5em 0.5em 0;
  font-style: italic;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 16px;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .search-results {
    columns: 1;
  }

  .dropdown {
    width: 50%;
  }
}
</style>