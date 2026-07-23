<template>
   <div class="container">

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
        <BiblioSource
          v-for="result in groupedSearchResults"
          :key="result.id"
          :source="result.source"
        />

        <p v-if="groupedSearchResults.length === 0">No matching quotes found.</p>

      </template>
    </section>

    <!-- Bibliography results -->
    <section v-else>
      <BiblioSource
        v-for="item in bibliographyItems"
        :key="item.id"
        :source="item"
        :initially-open="hashSourceId === item.id"
      />

      <p v-if="!bibliographyLoading &&
               !bibliographyError &&
                bibliographyItems.length === 0">
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
  ref,
  watch,
} from "vue"
import { useRoute } from "vue-router"

import { getFilterTypes, quoteSearch } from "@/assets/db"
import BiblioSource from "./BiblioSource.vue"

const SOURCE_API_URL = "/api/source/"

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
const hashSourceId = ref(null)

const searchInput = ref("")
const searchQuery = ref("")
const searchResults = ref([])
const searchLoading = ref(false)
const searchError = ref("")

const page = ref(1)
const pageSize = 100
const resultCount = ref(0)

let searchTimer
let bibliographyController

const hasSearchQuery = computed(() => {
  return searchQuery.value.trim().length > 0
})

const groupedSearchResults = computed(() => {
  const grouped = new Map()

  for (const result of searchResults.value) {
    const source = result.source

    if (!source?.id) {
      continue
    }

    if (!grouped.has(source.id)) {
      grouped.set(source.id, {
        source,
        pages: [],
      })
    }

    if (result.page) {
      const pageValue = String(result.page)
      const entry = grouped.get(source.id)

      if (!entry.pages.includes(pageValue)) {
        entry.pages.push(pageValue)
      }
    }
  }

  return Array.from(grouped.values())
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
    selectedLetter.value = ""
  } else {
    selectedLetter.value = letter
  }
}

function selectType(type) {
  if (selectedType.value === type) {
    return
  }

  selectedType.value = type
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
    hashSourceId.value = id
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
})

</script>

<style scoped>

a {
  color: var(--link-color);
  text-decoration: none;
}

article {
  margin-bottom: 0.5rem;
}

@media (min-width: 900px) {
  div .container {
    padding: 1rem 5rem 0 4rem;
    max-width: 75%;
  }

  div .alphabet-container {
    display: flex;
    gap: 2rem;
    border-radius: 0.3em;
  }
}

div .alphabet {
  background-color: #eee;
  padding: 0.1em;
  margin-bottom: 0.5em;
  border-radius: 0.3em;
  align-self: center;
  & button {
    background-color: #eee;
    border: none;
    font-size: larger;
    color: var(--link-color);
  };
  & button:hover {
      color: var(--vt-c-white);
      background-color: #666;
      border-radius: 0.3em;
  };
  & button[aria-pressed="true"] {
    color: var(--vt-c-white);
    background-color: #666;
    border-radius: 0.3em;
  }
}

button {
  font-family: inherit;
}

div .quoteSearch {
  width: 50%;
  margin-bottom: 0.5em;
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
  background-color: var(--contrast-color);
  color: white;
}

.tag:hover {
  background-color: var(--contrast-color);
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

</style>

