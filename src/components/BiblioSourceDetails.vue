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
  
      <hr v-if="quotes.length > 0" />
  
      <template v-for="quote in quotes" :key="quote.id">
        <div class="quote">
          <div
            v-if="quote.quote_transcription"
            class="left"
          >
            <span v-if="quote.language" class="lang">
              {{ quote.language }}
              <br />
            </span>
  
            <div v-html="quote.quote_transcription" />
  
            <template v-if="quote.quote_transcribed_by">
              {{ quote.quote_transcribed_by }}
              <br />
            </template>
  
            <template v-if="quote.translation">
              <span class="lang">
                eng
                <br />
              </span>
  
              <div v-html="quote.translation" />
            </template>
  
            <template v-if="quote.translation_by">
              {{ quote.translation_by }}
            </template>
  
            <div v-if="quote.comment">
              <strong>Comment:</strong>
              <div v-html="quote.comment" />
            </div>
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
  
          <hr />
        </div>
      </template>
  
      <p v-if="quotes.length === 0">
        <em>No quotes connected to source</em>
      </p>
    </div>
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