<template>
   <div class="container">
    <Popup
      v-if="isPopupOpen && selectedQuote"
      class="popup"
      @close="closePopup"
    >
      <template #header>
        <span>
          {{ selectedQuote.source?.name }}
          <span v-if="selectedQuote.page">
            p. {{ selectedQuote.page }}
          </span>
        </span>
      </template>

      <template #body>
        <div
          v-if="selectedQuote.quote_transcription"
          v-html="selectedQuote.quote_transcription"
        />

        <template v-if="selectedQuote.translation">
          <p><strong>Translation:</strong></p>
          <div v-html="selectedQuote.translation" />
        </template>
      </template>
    </Popup>

    <div class="alphabet-container">
      <div
        class="alphabet"
        aria-label="Filter bibliography by first letter"
      >
        <button
          v-for="letter in alphabet"
          :key="letter"
          type="button"
          :aria-pressed="selectedLetter === letter"
          :class="{ active: selectedLetter === letter }"
          @click="selectLetter(letter)"
        >
          {{ letter }}
        </button>
      </div>

      <div class="quoteSearch">
        <form @submit.prevent>
          <input
            v-model="searchInput"
            type="search"
            class="frminp"
            placeholder="Search for quotes in sources"
          />
        </form>
      </div>
    </div>

    <fieldset>
      <label>
        <input v-model="ordering" type="radio" value="title"/>
        Order by title
      </label>

      <label>
        <input v-model="ordering" type="radio" value="author"/>
        Order by author
      </label>
    </fieldset>

    <nav class="tag-bar" aria-label="Filter bibliography by source type">
      <button
        v-for="type in sourceTypes"
        :key="type.value"
        type="button"
        class="tag"
        :class="{ active: selectedType === type.value }"
        @click="selectType(type.value)"
      >
        {{ type.label }}
      </button>
    </nav>

    <p v-if="bibliographyError">{{ bibliographyError }}</p>
    <p v-if="bibliographyLoading">Loading bibliography...</p>

    <!-- Quote search results -->
    <section v-if="hasSearchQuery" class="searchRes">
      <h4>
        Search results for
        <em>“{{ searchQuery }}”</em>
      </h4>

      <p v-if="searchError">{{ searchError }}</p>
      <p v-if="searchLoading">Searching...</p>

      <template v-else>
        <div class="grid">
          <button
            v-for="result in searchResults"
            :key="result.id"
            type="button"
            class="click"
            @click="openPopup(result.id)"
          >
            {{ result.source?.name }}

            <span v-if="result.page">
              p. {{ result.page }}
            </span>
          </button>
        </div>

        <p v-if="searchResults.length === 0">No matching quotes found.</p>

        <div v-if="totalPages > 1" class="my-2 nav">
          <button
            type="button"
            class="frmbtn"
            :disabled="page <= 1 || searchLoading"
            @click="previousPage"
          >
            ←
          </button>

          <span>
            Page {{ page }} of {{ totalPages }}
            ({{ resultCount }} items)
          </span>

          <button
            type="button"
            class="frmbtn"
            :disabled="page >= totalPages || searchLoading"
            @click="nextPage"
          >
            →
          </button>
        </div>
      </template>
    </section>

    <!-- Bibliography results -->
    <section v-else>
      <article
        v-for="item in bibliographyItems"
        :id="String(item.id)"
        :key="item.id"
        class="results rowItem"
      >
        <button
          type="button"
          class="toggleBtn"
          :aria-expanded="isRowOpen(item.id)"
          :aria-controls="`source-details-${item.id}`"
          @click="toggleSource(item.id)"
        >
          {{ isRowOpen(item.id) ? "−" : "+" }}
        </button>

        <router-link :to="{ hash: `#${item.id}` }" class="hash-link">
          <span v-if="item.author">{{ item.author }}.</span>
          <span v-else-if="item.name">{{ item.name }}.</span>
          <em v-if="item.title">{{ item.title }}.</em>
          <span v-if="item.archive_name">{{ item.archive_name }}.</span>
          <span v-if="item.archive">{{ item.archive }}.</span>
          <span v-if="item.insource">{{ item.insource }},</span>
          <span v-if="item.publisher">{{ item.publisher }},</span>
          <span v-if="item.pub_year">{{ item.pub_year }}.</span>
          <span v-if="item.pub_place">{{ item.pub_place }}.</span>
        </router-link>

        <a v-if="item.uri" :href="item.uri"
          target="_blank" rel="noopener noreferrer" class="digi-link">
          Digitized version
        </a>

        <div
          v-if="isRowOpen(item.id)"
          :id="`source-details-${item.id}`"
          class="sourceInfo"
        >
          <p v-if="isSourceLoading(item.id)">
            Loading source information...
          </p>

          <p v-else-if="sourceErrors[item.id]">
            {{ sourceErrors[item.id] }}
          </p>

          <template v-else-if="sourceDetails[item.id]">
            <BiblioSourceDetails
              :source="sourceDetails[item.id]"
            />
          </template>
        </div>
      </article>

      <p
        v-if="
          !bibliographyLoading &&
          !bibliographyError &&
          bibliographyItems.length === 0
        "
      >
        No bibliography entries found.
      </p>
    </section>

</div>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue"
import { useRoute } from "vue-router"

import { getFilterTypes, quoteSearch } from "@/assets/db"
import Popup from "./Popup.vue"
import BiblioSourceDetails from "./BiblioSourceDetails.vue"

const SOURCE_API_URL = "/api/source/"
const QUOTE_API_URL = "/api/quote/"

const alphabet = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "Å", "Ä", "Ö",
]

const sourceTypes = [
  { label: "All", value: "All" },
  { label: "Manuscripts", value: "Ms" },
  { label: "Printed", value: "Tryckt" },
  { label: "Digital", value: "Digital" },
  { label: "Oral", value: "Oral" },
  { label: "Other", value: "Other" },
]

const route = useRoute()

const bibliographyItems = ref([])
const selectedLetter = ref("A")
const selectedType = ref("All")
const ordering = ref("title")

const bibliographyLoading = ref(false)
const bibliographyError = ref("")

const openSourceId = ref(null)
const sourceDetails = reactive({})
const sourceLoading = reactive({})
const sourceErrors = reactive({})

const searchInput = ref("")
const searchQuery = ref("")
const searchResults = ref([])
const searchLoading = ref(false)
const searchError = ref("")

const page = ref(1)
const pageSize = 100
const resultCount = ref(0)

const isPopupOpen = ref(false)
const selectedQuote = ref(null)

let searchTimer
let bibliographyController
let sourceController
let quoteController

const hasSearchQuery = computed(() => {
  return searchQuery.value.trim().length > 0
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(resultCount.value / pageSize))
})

function buildBibliographyQuery() {
  const parameters = new URLSearchParams()

  if (selectedLetter.value) {
    parameters.set("letter", selectedLetter.value)
  }

  if (selectedType.value === "Other") {
    parameters.set("type", "")
  } else if (selectedType.value !== "All") {
    parameters.set("type", selectedType.value)
  }

  parameters.set("ordering", ordering.value)

  return `?${parameters.toString()}`
}

async function fetchBibliography() {
  bibliographyController?.abort()
  bibliographyController = new AbortController()

  bibliographyLoading.value = true
  bibliographyError.value = ""

  closeOpenSource()

  try {
    const query = buildBibliographyQuery()
    const response = await getFilterTypes("source", query)

    bibliographyItems.value = response.results ?? []
  } catch (error) {
    if (error?.name === "AbortError") {
      return
    }

    bibliographyItems.value = []
    bibliographyError.value = "Could not load the bibliography."
    console.error(error)
  } finally {
    bibliographyLoading.value = false
  }
}

function selectLetter(letter) {
  if (selectedLetter.value === letter) {
    return
  }

  selectedLetter.value = letter
}

function selectType(type) {
  if (selectedType.value === type) {
    return
  }

  selectedType.value = type
}

function isRowOpen(id) {
  return openSourceId.value === id
}

function isSourceLoading(id) {
  return sourceLoading[id] === true
}

function closeOpenSource() {
  openSourceId.value = null
}

async function toggleSource(id) {
  if (openSourceId.value === id) {
    openSourceId.value = null
    return
  }

  openSourceId.value = id

  /*
   * Request same source only once after it has been loaded.
   */
  if (sourceDetails[id]) {
    return
  }

  sourceController?.abort()
  sourceController = new AbortController()

  sourceLoading[id] = true
  sourceErrors[id] = ""

  try {
    const response = await fetch(`${SOURCE_API_URL}${id}/`, {
      signal: sourceController.signal,
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Source request failed with ${response.status}.`)
    }

    sourceDetails[id] = await response.json()
  } catch (error) {
    if (error?.name === "AbortError") {
      return
    }

    sourceErrors[id] = "Could not load the source information."
    console.error(error)
  } finally {
    sourceLoading[id] = false
  }
}

async function searchQuotes() {
  const query = searchQuery.value.trim()

  if (!query) {
    searchResults.value = []
    resultCount.value = 0
    page.value = 1
    searchError.value = ""
    return
  }

  searchLoading.value = true
  searchError.value = ""

  try {
    const response = await quoteSearch(
      query,
      page.value,
      pageSize,
    )

    searchResults.value = response.results ?? []
    resultCount.value = response.count ?? 0
  } catch (error) {
    searchResults.value = []
    resultCount.value = 0
    searchError.value = "Could not search for quotes."
    console.error(error)
  } finally {
    searchLoading.value = false
  }
}

function previousPage() {
  if (page.value <= 1) {
    return
  }

  page.value -= 1
}

function nextPage() {
  if (page.value >= totalPages.value) {
    return
  }

  page.value += 1
}

async function openPopup(quoteId) {
  quoteController?.abort()
  quoteController = new AbortController()

  try {
    const response = await fetch(`${QUOTE_API_URL}${quoteId}/`, {
      signal: quoteController.signal,
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Quote request failed with ${response.status}.`)
    }

    selectedQuote.value = await response.json()
    isPopupOpen.value = true
  } catch (error) {
    if (error?.name === "AbortError") {
      return
    }

    console.error(error)
  }
}

function closePopup() {
  isPopupOpen.value = false
  selectedQuote.value = null
}

async function loadSourceFromHash(hash) {
  const id = Number(hash.replace("#", ""))

  if (!Number.isInteger(id) || id <= 0) {
    return
  }

  bibliographyLoading.value = true
  bibliographyError.value = ""

  try {
    const response = await fetch(`${SOURCE_API_URL}${id}/`, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Source request failed with ${response.status}.`)
    }

    const source = await response.json()

    bibliographyItems.value = [source]
    sourceDetails[id] = source
    openSourceId.value = id
  } catch (error) {
    bibliographyItems.value = []
    bibliographyError.value = "Could not load the requested source."
    console.error(error)
  } finally {
    bibliographyLoading.value = false
  }
}

/*
 * Watcher for bibliography filters.
 */
watch(
  [selectedLetter, selectedType, ordering],
  fetchBibliography,
)

/*
 * Debounce quote searching.
 */
watch(searchInput, (value) => {
  window.clearTimeout(searchTimer)

  searchTimer = window.setTimeout(() => {
    page.value = 1
    searchQuery.value = value.trim()
  }, 500)
})

/*
 * Run a search when the debounced query or page changes.
 */
watch(
  [searchQuery, page],
  searchQuotes,
)

/*
 * Support route changes without needing to reload the complete component.
 */
watch(
  () => route.hash,
  async (hash) => {
    if (hash) {
      await loadSourceFromHash(hash)
    } else if (!hasSearchQuery.value) {
      await fetchBibliography()
    }
  },
)

onMounted(async () => {
  if (route.hash) {
    await loadSourceFromHash(route.hash)
    return
  }

  await fetchBibliography()
})

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer)

  bibliographyController?.abort()
  sourceController?.abort()
  quoteController?.abort()
})

</script>

<style scoped>

a {
  color: var(--link-color);
  text-decoration: none;
}

div .container {
  padding: 1rem 5rem 0 4rem;
  max-width: 75%;
}

div .alphabet-container {
  display: flex;
  justify-content: space-between;
}

div .alphabet {
  & button {
    border: none;
    font-size: larger;
    color: var(--link-color);
  };
  & button:hover {
      color: var(--vt-c-white);
      background-color: #666;
  };
  & button.aria-pressed {
    background-color: #666;
  }
}

button {
  font-family: inherit;
}

div .quoteSearch {
  width: 50%;
}

fieldset {
  border: none;
  padding-left: 0;
  & label {
    margin-right: 1rem;
  }
}

nav.tag-container {
  margin-bottom: 20px;
  & button.menuitem {
    margin-right: 0.5rem;
  }
}

.tag-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block: 1rem;
}

@media screen and (max-width: 900px) {
  .tag-bar {
    display: block;
    gap: 0.4rem;
    font-size: 16px;
  }

  .tag {
    margin-right: 0.4rem;
    margin-bottom: 0.4rem;
  }
}

.tag {
  display: inline-block;
  padding: 0 0.5em;
  border: none;
  font-size: large;
  border-radius: 0.3em;
  background-color: #e8e8e8;
  transition: all ease-in-out 200ms;
  cursor: pointer;
}

.tag.active {
  background-color: #ff8000;
  color: white;
}

.tag:hover {
  background-color: #ff8000;
  color: white;
}

@media (max-width: 900px) {
  .tag-bar {
    display: block;
    gap: 0.4rem;
    font-size: 16px;
  }

  .tag {
    margin-right: 0.4rem;
    margin-bottom: 0.4rem;
  }
}

.hash-link {
  color: var(--color-text)
}

article.rowItem {
  margin-bottom: 8px;
}

button.toggleBtn {
  cursor: pointer;
  font-size: 15px;
  margin-right: 10px;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 50%;
  border: 2px solid #ccc;
  -webkit-box-shadow: 0 4px 6px rgba(0,0,0,.2);
  box-shadow: 0 4px 6px rgba(0,0,0,.2);
  display: inline-flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-transition: all .2s ease;
  transition: all .2s ease;
  &:hover {
    color: var(--contrast-color);
    border-color: var(--contrast-color);
    -webkit-box-shadow: 0 6px 8px rgba(0,0,0,.3);
    box-shadow: 0 6px 8px rgba(0,0,0,.3);
  }
}

</style>

