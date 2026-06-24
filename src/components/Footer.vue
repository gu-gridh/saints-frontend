<script setup>
import { useFooterSettings } from '@/composables/useFooterSettings'

const { footer } = useFooterSettings()
</script>

<template>
  <footer v-if="footer">
    <div class="partners">
      <a
        v-for="link in footer.partner_links"
        :key="link.value.url"
        :href="link.value.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ link.value.label }}
      </a>
    </div>
  </footer>
</template>

<style scoped>
  footer {
    background-color: #ececec;
    color: #212529;
    line-height: 1;
    height: 70px;
    width: calc(100% + 3em);
    left:0em;
    font-size: 12px;
    position: fixed;
    z-index: 3000;
    bottom: 0px;
    font-family: "Barlow Condensed", sans-serif;
  }

  a:link {
    color: #212529 !important;
    text-decoration: none;
  }
    
  a:visited, a:hover {
    color: #212529 !important;
  }
        
  .partners {
    float: right;
    position: fixed;
    bottom: 0px;
    right: 0px;
    height: 70px;
    font-weight: 100;
    font-style: normal;
    font-size: 30px;
    line-height: 0.8;
    padding: 20px 30px 5px 30px;
  }

  .partners a + a::before {
    content: " | ";
  }

  @media screen and (max-width: 950px) {
    footer {
      display:none;
    }
  }
</style>