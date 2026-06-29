<template>
  <ExploreFilters>
    <h4>Filter by Type of Evidence for Cult Manifestation (max 1)</h4>

    <TagBar
      :tags="areas"
      v-model="areasSelected"
      :max="1"
      :key="componentKey"
    />

    <div v-if="areasSelected.length">
      <h4 v-if="Object.keys(types).length > 0">Filter by type (max 4)</h4>

      <TagBar
        :tags="types"
        v-model="typesSelected"
        :max="4"
        :colors="colors"
        :key="componentKey2"
      />
    </div>

    <div v-if="typesSelected.length">
      <h4>Specific Type of Evidence (max 4)</h4>

      <TagBar
        :tags="filterTypes"
        v-model="filterTypesSelected"
        :colors="colors"
        :max="4"
        :key="componentKey3"
      />
    </div>

    <div class="input-group">
      <label for="diocese">Filter by Medieval Diocese</label>

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

      <label v-if="areasSelected.includes(3)" for="date">Date</label>

      <input
        v-if="areasSelected.includes(3)"
        id="date"
        v-model="feastDayFreetext"
        type="text"
        name="date"
      >
    </div>

    <div class="extant" v-show="showRadio">
      <input id="all" v-model="extantValue" type="radio" name="extant" value="All">
      <label class="radiobtn" for="all">All</label>

      <input id="extant" v-model="extantValue" type="radio" name="extant" value="Extant">
      <label class="radiobtn" for="extant">Extant</label>

      <input id="lost" v-model="extantValue" type="radio" name="extant" value="Lost">
      <label class="radiobtn" for="lost">Lost</label>
    </div>

    <button @click="clearAll" class="clearbtn">Clear search</button>

    <FreetextInput v-if="!feastDayFreetext" v-model="freetext" />

    <div class="search-container">
      <span v-if="searchDateRange != null" class="option-count">
        Search results for {{ searchDateRange[0] }} - {{ searchDateRange[1] }}
      </span>

      <span class="option-count">{{ cultsNum }} items</span>

      <span class="checkbox-container">
        <label>
          Exclude uncertain manifestations
          <input type="checkbox" v-model="uncertainty">
        </label>
      </span>
      <br>
    </div>

    <hr>

    <OptionList
      class="search-results"
      :options="cultsOptions"
      :max="0"
      @input="onCultSelected"
    />

    <div v-if="cultsNum > max" class="my-2 nav">
      <button class="frmbtn" :disabled="page <= 1" @click="goBack">←</button>

      <span>Page {{ page }} of {{ totalPages }} ({{ cultsNum }} items)</span>

      <button class="frmbtn" :disabled="page >= totalPages" @click="loadMore">
        →
      </button>
    </div>
  </ExploreFilters>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getFilterTypes, get } from '@/assets/db'
import { markerColors } from '@/assets/map'
import { useSaintsStore } from '@/stores/mode'

import ExploreFilters from '@/components/ExploreFilters.vue'
import TagBar from '@/components/TagBar.vue'
import OptionList from '@/components/OptionList.vue'
import FreetextInput from '@/components/FreetextInput.vue'

const router = useRouter()
const store = useSaintsStore()

const max = 200
const colors = computed(() => markerColors(1))

const types = ref([])
const typesSelected = ref([])
const freetext = ref('')
const cults = ref([])
const cultsNum = ref(0)

const areas = ref([])
const areasSelected = ref([])

const dioceseTypes = ref([])
const diocesesSelected = ref('')

const componentKey = ref(0)
const componentKey2 = ref(0)
const componentKey3 = ref(0)

const filterTypes = ref([])
const filterTypesSelected = ref([])

const showRadio = ref(false)
const page = ref(1)
const totalPages = ref(0)

const uncertainty = ref(false)
const extantValue = ref('All')
const feastDayFreetext = ref('')

const searchDateRange = computed(() => store.searchDateRange)

function onCultSelected(selected) {
  const id = Array.isArray(selected)
    ? selected[selected.length - 1]
    : selected
  if (id) {
    router.push(`/explore/cults/${id}`)
  }
}

const cultsOptions = computed(() => {
  return cults.value.map(cult => ({
    key: cult.id,
    label: [
      cult.place,
      cult.cult_type,
      cult.relation_cult_agent,
    ].filter(Boolean).join(', '),
    id: cult.id,
  }))
})

const activeTypeFilter = computed(() => {
  if (filterTypesSelected.value.length) {
    return filterTypesSelected.value
  }

  if (typesSelected.value.length) {
    return typesSelected.value
  }

  if (areasSelected.value.length) {
    return areasSelected.value
  }

  return []
})

async function load() {
  store.setMode?.('cults')

  const areasResponse = await getFilterTypes('culttype', '?level=Type of Evidence')
  areas.value = areasResponse?.results || areasResponse?.data?.results || []

  const dioceseResponse = await get('diocese', {
    search: '',
    mini: '',
    type: 'Medival',
  })

  dioceseTypes.value = dioceseResponse?.results || []

  componentKey.value += 1

  await searchCults()
}
async function searchCults() {
  const conds = {
    mini: '',
    page: page.value,
    search: freetext.value,
  }

  const typeFilter = activeTypeFilter.value

  if (typeFilter.length) {
    conds.type = typeFilter.join(',')
  }

  if (diocesesSelected.value) {
    conds.med_diocese = diocesesSelected.value
  }

  if (extantValue.value === 'Extant') {
    conds.extant = 'Extant'
  } else if (extantValue.value === 'Lost') {
    conds.extant = 'Lost'
  }

  if (uncertainty.value === true) {
    conds.uncertainty = 'False'
  }

  if (feastDayFreetext.value) {
    conds.search = feastDayFreetext.value
    conds.feastday = true
  }

  if (searchDateRange.value != null) {
    conds.range = Array.isArray(searchDateRange.value)
      ? searchDateRange.value.join(',')
      : searchDateRange.value
  }

  console.log('cult query', conds)

  const result = await get('cult', conds)

  cults.value = result?.results || []
  cultsNum.value = result?.count || 0
  totalPages.value = Math.ceil(cultsNum.value / max)
}

async function getMediumTypes() {
  types.value = []

  if (!areasSelected.value.length) return

  const result = await getFilterTypes(
    'culttype',
    `?parent=${areasSelected.value.join(',')}`
  )

  types.value = result?.results || result?.data?.results || []
  componentKey2.value += 1
  componentKey.value += 1
}

async function getSpecificFilterTypes() {
  if (!typesSelected.value.length) {
    filterTypes.value = []
    return
  }

  const result = await getFilterTypes(
    'culttype',
    `?parent=${typesSelected.value.join(',')}`
  )

  filterTypes.value = result?.results || result?.data?.results || []
  componentKey3.value += 1
  componentKey.value += 1
}

function clearAll() {
  page.value = 1

  store.resetMode('cults')
  store.setSearchDateRange(null)
  store.setMapDateRange(null)

  areasSelected.value = []
  typesSelected.value = []
  filterTypesSelected.value = []
  diocesesSelected.value = ''
  freetext.value = ''
  feastDayFreetext.value = ''
  uncertainty.value = false
  extantValue.value = 'All'
  showRadio.value = false

  componentKey.value++
  componentKey2.value++
  componentKey3.value++

  searchCults()
}

function loadMore() {
  page.value += 1
  searchCults()

  document
    .getElementsByClassName('option-count')?.[0]
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function goBack() {
  page.value -= 1
  searchCults()
}

watch(typesSelected, async value => {
  page.value = 1
  filterTypesSelected.value = []

  if (!value.length) {
    
  } else {
    

    if (typeof store.setCultsTypes === 'function') {
      store.setCultsTypes([...value])
    } else {
      store.query.cults.types = [...value]
    }

    await getSpecificFilterTypes()
  }

  await searchCults()
})

watch(areasSelected, async value => {
  page.value = 1

  typesSelected.value = []
  filterTypesSelected.value = []

  if (value.includes(1)) {
    showRadio.value = true
  } else {
    extantValue.value = 'All'
    showRadio.value = false
  }

  

  if (typeof store.setAreaTypes === 'function') {
    store.setAreaTypes([...value])
  } else {
    store.query.cults.areas = [...value]
  }

  await getMediumTypes()
  await searchCults()
})

watch(diocesesSelected, async value => {
  page.value = 1

  if (typeof store.setDioceseTypes === 'function') {
    store.setDioceseTypes(value)
  } else {
    store.query.cults.dioceseState = value
  }

  await searchCults()
})

watch(filterTypesSelected, async value => {
  page.value = 1

  if (!value.length) {
    
  } else {
    

    if (typeof store.setFilterTypes === 'function') {
      store.setFilterTypes([...value])
    } else {
      store.query.cults.filterType = [...value]
    }
  }

  await searchCults()
})

watch(freetext, async () => {
  page.value = 1
  await searchCults()
})

watch(extantValue, async value => {
  page.value = 1

  if (typeof store.setExtant === 'function') {
    store.setExtant(value === 'All' ? null : value)
  } else {
    store.query.cults.extant = value === 'All' ? null : value
  }

  await searchCults()
})

watch(uncertainty, async () => {
  page.value = 1
  await searchCults()
})

watch(searchDateRange, async () => {
  page.value = 1
  await searchCults()
})

watch(feastDayFreetext, async () => {
  page.value = 1
  await searchCults()
})

onMounted(load)
</script>