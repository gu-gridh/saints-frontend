<script setup>
import { useFooterSettings } from '@/composables/useFooterSettings'

const { footer } = useFooterSettings()
</script>

<template>
  <footer v-if="footer">
    <a
      v-for="link in footer.partner_links"
      :key="link.value.url"
      :href="link.value.url"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ link.value.label }}
    </a>
  </footer>
</template>