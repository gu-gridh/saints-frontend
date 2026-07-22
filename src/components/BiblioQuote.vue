<template>
  <div>
    <p v-if="source.specific_type">
      <strong>Type:</strong>
      {{ source.specific_type }}
    </p>
  
    <div v-if="source.comment">
      <strong>Comment:</strong>
      <div v-html="source.comment" />
    </div>
  
    <template v-for="quote in quotes" :key="quote.id">
      <div class="quote">
        <div v-if="quote.quote_transcription">
          <span v-if="quote.language" class="lang">
            {{ quote.language }}<br />
          </span>
          <div class="transcr" v-html="quote.quote_transcription" />
          <template v-if="quote.quote_transcribed_by">
            {{ quote.quote_transcribed_by }}
          </template>
        </div>

        <div v-if="quote.translation">
          <span class="lang">eng<br /></span>
          <div class="transcr" v-html="quote.translation" />
          <template v-if="quote.translation_by">
            {{ quote.translation_by }}
          </template>
        </div>

        <div v-if="quote.comment">
          <strong>Comment:</strong>
          <div v-html="quote.comment" />
        </div>
  
      <div v-if="quote.cult?.length">
        <h4>Related cult manifestations</h4>
  
        <router-link
          v-for="cult in quote.cult"
          :key="cult.id"
          :to="`/explore/cults/${cult.id}`"
        >
          <p>
            {{ cult.place }},
            {{ cult.cult_type }},
            {{ cult.relation_cult_agent }}
          </p>
        </router-link>
      </div>
      </div>
    </template>
  </div>  
      
  <p v-if="quotes.length === 0">
    <em>No quotes connected to source</em>
  </p>
</template>
  
<script setup>
import { computed } from "vue"
  
const props = defineProps({
  source: {
    type: Object,
    required: true,
  },
})
  
const quotes = computed(() => {
  return Array.isArray(props.source.quote)
    ? props.source.quote
    : []
})
</script>

<style scoped>
hr {
  margin: 0.5rem 0;
  border: 0;
  border-top: 1px solid rgba(0,0,0,.1);
}

div.quote {
  padding: 1rem;
  border: 1px solid rgba(0,0,0,.1);
  border-radius: 0.3em;
}

div.transcr {
  margin-top: 0.5rem;
}

</style>