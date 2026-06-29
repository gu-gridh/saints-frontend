<template>
  <div class="date-slider">
<!--     <input
      v-model.number="localValue[0]"
      type="number"
      :min="MIN"
      :max="localValue[1]"
      :step="STEP"
      class="date-slider-boundary"
      @change="commitRange"
    /> -->

    <Slider
      :key="sliderKey"
      v-model="localValue"
      :min="MIN"
      :max="MAX"
      :step="STEP"
      :tooltips="true"
      :lazy="true"
      class="date-slider-slider"
    />

<!--     <input
      v-model.number="localValue[1]"
      type="number"
      :min="localValue[0]"
      :max="MAX"
      :step="STEP"
      class="date-slider-boundary"
      @change="commitRange"
    /> -->
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Slider from '@vueform/slider'
import '@vueform/slider/themes/default.css'
import { useSaintsStore } from '@/stores/mode'

const store = useSaintsStore()

const mapDateRange = computed(() => store.mapDateRange)

const MIN = 1050
const MAX = 1790
const STEP = 10

const sliderKey = ref(0)

const localValue = computed({
  get() {
    return store.mapDateRange || [MIN, MAX]
  },
  set(value) {
    const range = clampRange(value)
    const isFullRange = range[0] === MIN && range[1] === MAX
    store.setMapDateRange(isFullRange ? null : range)
    store.setSearchDateRange(isFullRange ? null : range)
  },
})

function clampRange(value) {
  const start = Math.max(MIN, Math.min(Number(value[0]) || MIN, MAX))
  const end = Math.max(start, Math.min(Number(value[1]) || MAX, MAX))
  return [start, end]
}

watch(
  () => store.mapDateRange,
  value => {
    if (!value) {
      localValue.value = [MIN, MAX]
      sliderKey.value += 1
      return
    }

    localValue.value = [...value]
    sliderKey.value += 1
  },
  { immediate: true }
)
</script>

<style scoped>
.date-slider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: min(520px, 80vw);
  padding: 0.4rem 0.75rem;
}

.date-slider-slider {
  flex: 1;
  min-width: 220px;
}

.date-slider-boundary {
  width: 4.5rem;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 0.35rem;
  padding: 0.2rem 0.3rem;
  background: rgba(255, 255, 255, 0.85);
}

/* Vueform slider CSS vars */
.date-slider-slider {
  --slider-connect-bg: orange;
  --slider-tooltip-bg: orange;
  --slider-handle-ring-color: rgba(255, 128, 0, 0.25);
  --slider-height: 3px;
  --slider-handle-width: 14px;
  --slider-handle-height: 14px;
}
</style>