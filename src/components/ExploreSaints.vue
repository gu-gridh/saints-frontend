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

    <h4>Filter by tags</h4>
    <TagBar
      :tags="personTypes"
      v-model="personTypesSelected"
      :max="4"
      :colors="colors"
      :key="componentKey2"
    />
    <button @click="clearAll" class="clearbtn">Clear search</button>
    <FreetextInput v-model="freetext" />
    <h4>Select saints (max 4)</h4>
    <span class="option-count">{{ saintsNum }} items</span>
    <OptionList
      class="search-results results1"
      :options="saintsOptions"
      :max="4"
      v-model="saintsSelected"
      :colors="colors"
    />

<!--     <OptionList
      class="search-results-mobile results2"
      :options="saintsOptionsMobile"
      :max="0"
      @input="onSaintSelectedMobile"
    /> -->

    <div v-if="saintsNum > max" class="my-2 nav">
      <button class="frmbtn" :disabled="page <= 1" @click="goBack">←</button>
      <span>Page {{ page }} of {{ totalPages }} ({{ saintsNum }} items)</span>
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
import { useSaintsStore } from '@/stores/mode'
import { markerColors } from '@/assets/map'
import infoIcon from '@/assets/icons/information.png'
import ExploreFilters from '@/components/ExploreFilters.vue'
import TagBar from '@/components/TagBar.vue'
import OptionList from '@/components/OptionList.vue'
import FreetextInput from '@/components/FreetextInput.vue'

const router = useRouter()
const store = useSaintsStore()
const max = 200
const colors = computed(() => markerColors(1))

const sexes = {
  all: { name: 'All saints', id: '' },
  Man: { name: 'Male', id: 'Man' },
  Woman: { name: 'Female', id: 'Woman' },
}

const sexesSelected = ref([''])
const personTypes = ref([])
const personTypesSelected = ref([])
const freetext = ref('')
const saints = ref([])
const saintsSelected = ref([])
const page = ref(1)
const saintsNum = ref(0)
const componentKey = ref(0)
const componentKey2 = ref(1)
const totalPages = ref(0)
const searchDateRange = computed(() => store.searchDateRange)

const saintsOptions = computed(() => {
  return saints.value
    .map(saint => ({
      key: saint.id,
      label: saint.name,
      id: saint.id,
      links: [
        {
          to: `/explore/saints/${saint.id}`,
          icon: infoIcon,
        },
      ],
    }))
    .slice(0, max)
})

const saintsOptionsMobile = computed(() => {
  return saints.value.map(saint => ({
    key: saint.id,
    label: saint.name,
    id: saint.id,
  }))
})

async function load() {
  store.setMode?.('saints')
  const typesResponse = await search('agenttype', {
    saint: 'True',
  })
  personTypes.value = typesResponse?.results || typesResponse?.data?.results || []
  await searchSaints()
}

async function searchSaints() {
  const query = {
    search: freetext.value,
    mini: '',
    page: page.value,
    gender: sexesSelected.value[0] || '',
  }
  if (searchDateRange.value !== undefined) {
    query.range = searchDateRange.value
  }
  if (personTypesSelected.value.length) {
    query.type = personTypesSelected.value.join(',')
  }
  const result = await get('saints', query)
  saints.value = result?.results || []
  saintsNum.value = result?.count || 0
  totalPages.value = Math.ceil(saintsNum.value / max)
}

function clearAll() {
  sexesSelected.value = ['']
  personTypesSelected.value = []
  freetext.value = ''
  saintsSelected.value = []
  page.value = 1
  componentKey.value += 1
  componentKey2.value += 1
  store.query.saints.sex = 'all'
  store.query.saints.types = []
  store.query.saints.saints = []
  searchSaints()
}

function loadMore() {
  page.value += 1
  searchSaints()
  document
    .getElementsByClassName('option-count')?.[0]
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function goBack() {
  page.value -= 1
  searchSaints()
}

function onSaintSelectedMobile(selected) {
  const id = Array.isArray(selected) ? selected[selected.length - 1] : selected
  if (id) {
    router.push(`/explore/saints/${id}`)
  }
}

watch(sexesSelected, async value => {
  page.value = 1
  if (typeof store.setSaintsSex === 'function') {
    store.setSaintsSex(value[0])
  } else {
    store.query.saints.sex = value[0]
  }
  await searchSaints()
})

watch(personTypesSelected, async value => {
  page.value = 1
  if (typeof store.setSaintsTypes === 'function') {
    store.setSaintsTypes([...value])
  } else {
    store.query.saints.types = [...value]
  }
  await searchSaints()
})

watch(saintsSelected, value => {
  if (typeof store.setSaints === 'function') {
    store.setSaints(value)
  } else {
    store.query.saints.saints = value
  }
})

watch(freetext, async () => {
  page.value = 1
  await searchSaints()
})

watch(searchDateRange, async () => {
  page.value = 1
  await searchSaints()
})

onMounted(load)

</script>