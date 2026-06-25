<template>
  <div class="option-list">
    <div
      v-for="{ label, links, key } in options"
      :key="key"
      :class="{ active: localValue.includes(key) }"
      class="option"
      :style="{ backgroundColor: getSelectedColor(key) }"
      @click="toggle(key)"
    >
      <template v-if="links">
        <div class="label">{{ label }}</div>

        <div class="links" @click.stop>
          <RouterLink v-for="{ to, icon } in links" :key="to" :to="to">
            <img :src="icon" alt="info" />
          </RouterLink>
        </div>
      </template>

      <RouterLink v-else :to="`/explore/${mode}/${key}`">
        <div class="label">{{ label }}</div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useSaintsStore } from '@/stores/mode'

const store = useSaintsStore()

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  required: {
    type: Boolean,
    default: false,
  },
  max: {
    type: Number,
    default: null,
  },
  colors: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'input'])

const mode = computed(() => store.mode)

const localValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
    emit('input', value)
  },
})

function toggle(key) {
  const current = [...localValue.value]

  if (props.max === null) {
    localValue.value = []
    return
  }

  if (current.includes(key) && !props.required) {
    localValue.value = current.filter(id => id !== key)
    return
  }

  if (props.max && current.length >= props.max) {
    console.warn(`You cannot select more than ${props.max} options.`)
    return
  }

  localValue.value = [...current, key]
}

function getSelectedColor(key) {
  const index = localValue.value.indexOf(key)

  if (index >= 0) {
    return props.colors[index]
  }

  return undefined
}

watch(
  () => props.options,
  options => {
    const validKeys = options.map(option => option.key)

    const filteredValue = localValue.value.filter(key =>
      validKeys.includes(key)
    )

    if (filteredValue.length !== localValue.value.length) {
      localValue.value = filteredValue
    }
  }
)
</script>

<style scoped>
.option-count {
  display: grid;
  padding: 0 0.5em;
  font-style: italic;
  margin-bottom: 5px;
}

.label {
  font-size: 17px !important;
}

.option {
  cursor: pointer;
  padding: 0 0.5em;
  border-radius: 0.3em;
  transition: all ease-in-out 200ms;
  display: flex;
  justify-content: space-between;
}

.option:hover {
  background-color: #e8e8e8;
}

.option.active {
  background-color: #ff8000;
  color: white;
}

.option .links {
  opacity: 0;
  transition: all ease-in-out 200ms;
}

.option:hover .links {
  opacity: 1;
}

@media (max-width: 768px) {
  .option {
    padding: 0;
  }

  .label {
    font-size: 14px !important;
  }

  .option-count {
    font-size: 14px !important;
  }
}
</style>