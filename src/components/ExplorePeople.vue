<template>
  <ExploreFilters>
    <h4>Filter by gender</h4>
    <TagBar
      :tags="sexes"
      v-model="sexesSelected"
      :max="1"
      required
      :key="componentKey"
    />

    <h4>Filter by person type</h4>
    <TagBar
      :tags="personTypes"
      v-model="personTypesSelected"
      :max="4"
      :colors="colors"
      :key="componentKey2"
    />

    <button @click="clearAll" class="clearbtn">Clear search</button>

    <FreetextInput v-model="freetext" />

    <h4>Select people (max 4)</h4>

    <span class="option-count">{{ peopleNum }} items</span>

    <OptionList
      class="search-results"
      :options="peopleOptions"
      :max="4"
      v-model="peopleSelected"
      :colors="colors"
    />

    <div v-if="peopleNum > max" class="my-2 nav">
      <button class="frmbtn" :disabled="page <= 1" @click="goBack">←</button>

      <span>Page {{ page }} of {{ totalPages }} ({{ peopleNum }} items)</span>

      <button class="frmbtn" :disabled="page >= totalPages" @click="loadMore">
        →
      </button>
    </div>
  </ExploreFilters>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { search, get } from '@/assets/db'
import { markerColors } from '@/assets/map'
import infoIcon from '@/assets/icons/information.png'
import { useSaintsStore } from '@/stores/mode'

import ExploreFilters from '@/components/ExploreFilters.vue'
import TagBar from '@/components/TagBar.vue'
import OptionList from '@/components/OptionList.vue'
import FreetextInput from '@/components/FreetextInput.vue'

const router = useRouter()
const store = useSaintsStore()

const max = 200
const colors = computed(() => markerColors(1))

const sexes = {
  all: { name: 'All people', id: '' },
  Man: { name: 'Male', id: 'Man' },
  Woman: { name: 'Female', id: 'Woman' },
}

const sexesSelected = ref([''])
const personTypes = ref([])
const personTypesSelected = ref([])
const freetext = ref('')
const people = ref([])
const peopleSelected = ref([])
const peopleNum = ref(0)
const page = ref(1)
const componentKey = ref(0)
const componentKey2 = ref(1)
const totalPages = ref(0)

const searchDateRange = computed(() => store.searchDateRange)

const peopleOptions = computed(() => {
  return people.value.map(person => ({
    key: person.id,
    label: person.name,
    id: person.id,
    links: [
      {
        to: `/explore/people/${person.id}`,
        icon: infoIcon,
      },
    ],
  }))
})

const peopleOptionsMobile = computed(() => {
  return people.value.map(person => ({
    key: person.id,
    label: person.name,
    id: person.id,
  }))
})

async function load() {
  store.setMode?.('people')

  const typesResponse = await search('agenttype', {
    saint: 'False',
  })

  personTypes.value = typesResponse?.results || typesResponse?.data?.results || []

  await searchPeople()
}

async function searchPeople() {
  const query = {
    search: freetext.value,
    mini: '',
    page: page.value,
    gender: sexesSelected.value[0] || '',
  }

  if (searchDateRange.value != null) {
    query.range = searchDateRange.value
  }

  if (personTypesSelected.value.length) {
    query.type = personTypesSelected.value.join(',')
  }

  const result = await get('people', query)

  people.value = result?.results || []
  peopleNum.value = result?.count || 0
  totalPages.value = Math.ceil(peopleNum.value / max)
}

function clearAll() {
  sexesSelected.value = ['']
  personTypesSelected.value = []
  peopleSelected.value = []
  freetext.value = ''
  page.value = 1
  componentKey.value += 1
  componentKey2.value += 1

  if (store.query?.people) {
    store.query.people.sex = 'all'
    store.query.people.types = []
    store.query.people.people = []
  }

  searchPeople()
}

function loadMore() {
  page.value += 1
  searchPeople()

  document
    .getElementsByClassName('option-count')?.[0]
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function goBack() {
  page.value -= 1
  searchPeople()
}

function onPersonSelectedMobile(selected) {
  const id = Array.isArray(selected) ? selected[selected.length - 1] : selected

  if (id) {
    router.push(`/explore/people/${id}`)
  }
}

watch(sexesSelected, async value => {
  page.value = 1

  if (typeof store.setPeopleSex === 'function') {
    store.setPeopleSex(value[0])
  } else {
    store.query.people.sex = value[0]
  }

  await searchPeople()
})

watch(personTypesSelected, async value => {
  page.value = 1

  if (typeof store.setPeopleTypes === 'function') {
    store.setPeopleTypes([...value])
  } else {
    store.query.people.types = [...value]
  }

  await searchPeople()
})

watch(peopleSelected, value => {
  if (typeof store.setPeople === 'function') {
    store.setPeople(value)
  } else {
    store.query.people.people = value
  }
})

watch(freetext, async () => {
  page.value = 1
  await searchPeople()
})

watch(searchDateRange, async () => {
  page.value = 1
  await searchPeople()
})

onMounted(load)
</script>

