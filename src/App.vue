<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useSaintsStore } from '@/stores/mode'

const store = useSaintsStore()


</script>

<template>
  <nav class="main-menu">
    <RouterLink to="/" class="main-menu-link">Home</RouterLink>
    <RouterLink to="/introduction" class="main-menu-link">Introduction</RouterLink>
    <RouterLink to="/explore" class="main-menu-link">Explore</RouterLink>
    <RouterLink to="/project" class="main-menu-link">Project</RouterLink>
    <RouterLink to="/bibliography" class="main-menu-link">Bibliography</RouterLink>
  </nav>
  <RouterView />
  <div id="footer" v-if="store.mode === ''">
  </div>  
</template>

<style scoped>
.main-menu {
  padding: 0 0 30px;
  font-size: 25px;
  font-weight: 200;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  position: relative;
  z-index: 10;
}

.main-menu-link {
  padding: 10px 15px 15px 15px;
}

.main-menu-link.router-link-active {
  background-color: #dc9614;
  color: #fff;
  font-weight: 200;
}
</style>
