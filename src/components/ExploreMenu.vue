<template>
  <div id="explore-type-menu" @click="startMap">
    <router-link to="/explore/places" class="item type-places">
      <Square class="img-container">
        <img src="@/assets/img/places.jpg" />
      </Square>
      <div class="label">Places</div>
    </router-link>

    <router-link to="/explore/saints" class="item type-saints">
      <Square class="img-container">
        <img src="@/assets/img/saints.jpg" />
      </Square>
      <div class="label">Saints</div>
    </router-link>

    <router-link to="/explore/cults" class="item type-cults">
      <Square class="img-container">
        <img src="@/assets/img/manifestations.jpg" />
      </Square>
      <div class="label">Manifestations</div>
    </router-link>

    <router-link to="/explore/people" class="item type-people">
      <Square class="img-container">
        <img src="@/assets/img/people.jpg" />
      </Square>
      <div class="label">People</div>
    </router-link>
  </div>
</template>

<script setup>
import Square from './Square.vue'

const startMap = () => {
  //set map center to the default one
}
</script>

<style scoped>
#explore-type-menu {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2em;
}
.item {
  width: 21%;
  max-width: 8.2rem;
  padding: 0.4rem;
  color: inherit;
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  mix-blend-mode: luminosity;
}
.type-saints img {
  filter: brightness(1.5);
}
.type-people img {
  filter: brightness(1.7);
}
.img-container {
  border-radius: 50%;
  background-color: black;
  overflow: hidden;
}
.item.router-link-active {
  color: #DC9614;
}
.item.router-link-active .img-container {
  background-color: #DC9614;
}
.item .label {
  font-size: 90%;
  text-transform: uppercase;
  text-align: center;
  margin: 0.5rem 0 0;
  word-wrap: break-word;
  line-height: 1.15;
}
</style>