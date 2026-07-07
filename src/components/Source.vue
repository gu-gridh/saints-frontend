<template>
  <div class="source">
    <Popup v-show="isModalVisible" class="popup" @close="closeModal">
      <template #header>
        {{ source.name }}{{ source.pages ? `: ${source.pages}` : '' }}.
        <span v-if="source" class="type">{{ source.source_type }}</span>
      </template>

      <template #body>
        <div v-if="sourceType === 'Tryckt'">
          <span v-if="source.author">{{ source.author }}.</span>
          {{ source.pub_year }}.
          <span class="cursive">{{ source.title }}.</span>
          <span v-if="source.publisher">{{ source.publisher }}. </span>
          {{ source.pub_place }}
        </div>

        <div v-if="sourceType === 'Ms'">
          <span class="cursive">{{ source.title }}. </span>
          <span v-if="source.archive_name">{{ source.archive_name }}. </span>
          {{ source.archive }}
        </div>

        <div v-if="sourceType === 'Digital' || sourceType === 'Oral'">
          <span class="cursive">{{ source.title }}.</span>
          <span v-if="source.archive_name">{{ source.archive_name }}. </span>
          {{ source.archive }}
          <span v-if="source.publisher">{{ source.publisher }}. </span>
          <span v-if="source.pub_place">{{ source.pub_place }}</span>
          <span v-if="source.pub_year">{{ source.pub_year }}</span>
        </div>

        <p v-if="quote.uri" class="link">
          <a :href="quote.uri" target="_blank">{{ quote.uri }}</a>
        </p>

        <p v-else-if="source.uri" class="link">
          <a :href="source.uri" target="_blank">{{ source.uri }}</a>
        </p>
      </template>

      <template #footer />
    </Popup>

    <div class="name" @click="showModal">
      <span>
        {{ source.name }}{{ quote.page ? `: ${quote.page}` : '' }}
        <button class="sourcebtn">Show reference</button>
      </span>
    </div>

    <div
        v-if="shouldShowQuote"
        class="quote"
        :class="{ collapsible: isCollapsible, collapsed: !expanded }"
        >
      <button
        v-if="isCollapsible"
        class="toggle"
        @click.stop="toggleExpanded"
      >
        {{ expanded ? 'Collapse' : 'Expand quote' }}
      </button>

      <br>

      <blockquote v-if="quote.quote_transcription">
        <span class="lang">{{ quote.language }}</span>
        <span v-html="quote.quote_transcription" class="quoteText"></span>
      </blockquote>

      <blockquote v-if="quote.translation">
        <span class="lang">en</span>
        <span v-html="quote.translation"></span>
      </blockquote>

      <span v-if="quote.uri" class="notinline quote-uri">
        <a :href="quote.uri" target="_blank">{{ quote.uri }}</a>
      </span>

      <span v-if="quote.comment" class="comment-label">Comment: </span>

      <blockquote
        v-if="quote.comment"
        class="notinline"
        v-html="quote.comment"
      />

      <div class="transcribed">
        <span v-if="quote.transcribed_by">
          Transcribed by {{ quote.transcribed_by }}
        </span>
        <br>
        <span v-if="quote.translated_by">
          Translated by {{ quote.translated_by }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Popup from './Popup.vue'
import { show } from '@/assets/db'

const props = defineProps({
  quote: {
    type: Object,
    default: () => ({}),
  },
  source_id: {
    type: [String, Number],
    default: null,
  },
})

const expanded = ref(false)
const isModalVisible = ref(false)

const source = ref({
  name: '',
  source_type: '',
})

const sourceType = ref('')

const quoteTextLength = computed(() => {
  return [
    props.quote.quote_transcription,
    props.quote.translation,
    props.quote.comment,
  ]
    .filter(Boolean)
    .join('')
    .length
})

const isCollapsible = computed(() => quoteTextLength.value > 0)

const hasQuote = computed(() =>
  Boolean(
    props.quote.quote_transcription ||
    props.quote.translation ||
    props.quote.comment
  )
)

const shouldShowQuote = computed(() => {
  return hasQuote.value && (expanded.value || isCollapsible.value)
})

function toggleExpanded() {
  expanded.value = !expanded.value
}

function showModal() {
  isModalVisible.value = true
}

function closeModal() {
  isModalVisible.value = false
}

onMounted(async () => {
  if (!props.source_id) return

  const response = await show('source', `${props.source_id}?mini`)

  source.value = response || {}
  sourceType.value = source.value.source_type || ''
})
</script>

<style scoped>
.source {
  margin-block: 0.5em;
  width: 100%;
}

.quote {
  position: relative;
  padding-bottom: 0.2em;
  padding-left: 0.3em;
}

.quote.collapsible.collapsed {
  max-height: 2em;
  overflow: hidden;
  border-bottom: thin dashed lightgray;
  font-size: 17px !important;
}

.quote.collapsible.collapsed blockquote {
  display: none;
}

.toggle {
  cursor: pointer;
  position: absolute;
  bottom: 0;
  right: 20px;
}

.name {
  cursor: pointer;
  font-size: large;
}

.transcribed {
  padding-bottom: 10px;
}

.cursive {
  font-style: italic;
}

:deep(p) {
  display: inline;
  margin-left: 0;
  padding: 0;
}

.notinline {
  display: block;
}

.sourcebtn {
  margin-left: 10px;
  font-size: 13px;
}

.link {
  font-size: 13px;
  justify-content: flex-start;
}

.type {
  font-style: italic;
  text-align: left;
}

.grid-container {
  display: block !important;
}

.quote-uri {
  font-size: large;
}

.comment-label {
  font-size: large;
  font-weight: bold;
}
</style>