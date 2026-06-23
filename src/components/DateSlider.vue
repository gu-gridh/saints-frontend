<template>
  <div class="date-slider">
    <input
      v-model="value[0]"
      :min="MIN"
      :max="MAX"
      :step="STEP"
      size="4"
      class="date-slider-boundary"
    />

    <Slider
      v-model="value"
      :min="MIN"
      :max="MAX"
      :interval="STEP"
      :duration="0"
      :adsorb="true"
      :lazy="true"
      :drag-on-click="true"
      tooltip="none"
      :contained="true"
      :dot-options="{
        style: {
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: '.7em .4em 0 .4em',
          borderColor: 'black transparent transparent transparent',
          backgroundColor: 'transparent',
          marginLeft: '.1em',
          marginTop: '-0.3em',
          borderRadius: 0,
          boxShadow: 'none',
        },
      }"
      :rail-style="{ height: '2px', marginTop: '.5em' }"
      :process-style="{ backgroundColor: 'orange' }"
      class="date-slider-slider"
    />
    <input
      v-model="value[1]"
      :min="MIN"
      :max="MAX"
      :step="STEP"
      size="4"
      class="date-slider-boundary"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Slider from '@vueform/slider'

const MIN = 1050;
const MAX = 1790;
const STEP = 10;

const value = ref([MIN, MAX])
</script>

<style scoped>
.date-slider {
  display: flex;
  align-items: center;
  padding: 0.2em 0.7em;
}
.date-slider-slider {
  flex: 1;
  margin-inline: 0.5em;
}
.date-slider-boundary {
  text-align: right;
  background-color: transparent;
  border: none;
}
</style>