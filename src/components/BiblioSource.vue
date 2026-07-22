<template>
  <article 
    :id="String(source.id)"
        :key="source.id"
        class="results rowsource">
    <button
       type="button"
       class="toggleBtn"
       :aria-expanded="isOpen"
       :aria-controls="`source-details-${source.id}`"
       @click="toggleSource"
    >
    {{ isOpen ? "−" : "+" }}
    </button>

    <router-link :to="{ hash: `#${source.id}` }" class="hash-link">
      <span v-if="source.author">{{ source.author }}. </span>
      <span v-else-if="source.name">{{ source.name }}. </span>
      <em v-if="source.title">{{ source.title }}. </em>
      <span v-if="source.archive_name">{{ source.archive_name }}.</span>
      <span v-if="source.archive">{{ source.archive }}. </span>
      <span v-if="source.insource">{{ source.insource }}, </span>
      <span v-if="source.publisher">{{ source.publisher }}, </span>
      <span v-if="source.pub_year">{{ source.pub_year }}. </span>
      <span v-if="source.pub_place">{{ source.pub_place }}. </span>
    </router-link>

    <a v-if="source.uri" :href="source.uri"
      target="_blank" rel="noopener noreferrer" class="digi-link">
      Digitized version
    </a>

    <div
      v-if="isOpen"
      :id="`source-details-${source.id}`"
       class="sourceInfo"
    >
        <p v-if="loading">
          Loading source information...
        </p>

        <p v-else-if="error">
           {{ error }}
        </p>

        <template v-else-if="sourceDetails">
            <BiblioQuote
              :source="sourceDetails"
            />
          </template>
    </div>
  </article>
</template>

<script setup>
import {
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue"

import BiblioQuote from "./BiblioQuote.vue"

const SOURCE_API_URL = "/api/source/"

const props = defineProps({
  source: {
    type: Object,
    required: true,
  },
  initiallyOpen: {
    type: Boolean,
    default: false,
  },
})

const isOpen = ref(props.initiallyOpen)
const sourceDetails = ref(null)
const loading = ref(false)
const error = ref("")

let sourceController = null

async function loadDetails() {
  if (sourceDetails.value || loading.value) {
    return
  }

  sourceController?.abort()
  sourceController = new AbortController()

  loading.value = true
  error.value = ""

  try {
    const response = await fetch(
      `${SOURCE_API_URL}${props.source.id}/`,
      {
        signal: sourceController.signal,
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(
        `Source request failed with ${response.status}.`,
      )
    }

    sourceDetails.value = await response.json()
  } catch (requestError) {
    if (
      requestError instanceof DOMException &&
      requestError.name === "AbortError"
    ) {
      return
    }

    error.value = "Could not load the source information."
    console.error(requestError)
  } finally {
    loading.value = false
  }
}

async function toggleSource() {
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    await loadDetails()
  }
}

watch(
  () => props.source.id,
  async () => {
    sourceController?.abort()

    sourceDetails.value = null
    loading.value = false
    error.value = ""
    isOpen.value = props.initiallyOpen

    if (isOpen.value) {
      await loadDetails()
    }
  },
)

/*
 * Keep the local open state synchronized if the parent changes
 * initiallyOpen.
 */
watch(
  () => props.initiallyOpen,
  async (shouldOpen) => {
    isOpen.value = shouldOpen

    if (shouldOpen) {
      await loadDetails()
    }
  },
)

onMounted(async () => {
  if (isOpen.value) {
    await loadDetails()
  }
})

onBeforeUnmount(() => {
  sourceController?.abort()
})
</script>

<style scoped>

a {
  color: var(--link-color);
  text-decoration: none;
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

div.sourceInfo {
  padding: 1rem;
  background-color: var(--vt-c-white-soft);
  border-radius: .3em;
  font-size: smaller;
}
</style>