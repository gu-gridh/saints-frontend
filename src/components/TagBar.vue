<template>
  <div class="tag-bar">
    <span
        v-for="label in tagList"
        :key="label.id"
        class="tag tag-bar-tag"
        :class="{ active: localValue.includes(label.id) }"
        :style="{ backgroundColor: getSelectedColor(label.id) }"
        @click="toggle(label.id)"
        >
        {{ label.name }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tags: {
    type: [Array, Object],
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
    default: 0,
  },
  colors: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const tagList = computed(() => {
  return Array.isArray(props.tags)
    ? props.tags
    : Object.values(props.tags || {})
})

const localValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

function toggle(key) {
  const current = [...localValue.value]

  if (current.includes(key) && !props.required) {
    localValue.value = current.filter(id => id !== key)
    return
  }

  if (props.max && current.length >= props.max) {
    if (current.length === 1 && current[0] === key) return
    localValue.value = [key]
    return
  }

  if (!current.includes(key)) {
    localValue.value = [...current, key]
  }
}

function getSelectedColor(key) {
  const index = localValue.value.indexOf(key)

  if (index >= 0) {
    return props.colors[index]
  }

  return undefined
}

defineExpose({
  clearSearch() {
    localValue.value = []
  },
})
</script>

<style scoped>
.tag-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block: 0.5rem;
}

.tag-bar-tag {
  cursor: pointer;
}

@media screen and (max-width: 900px) {
  .tag-bar {
    display: block;
    gap: 0.4rem;
    font-size: 16px;
  }

  .tag-bar-tag {
    display: inline-block;
    margin-right: 0.4rem;
    margin-bottom: 0.4rem;
  }
}

.tag {
  display: inline-block;
  padding: 0 0.5em;
  border-radius: 0.3em;
  font-size: 90%;
  background-color: #e8e8e8;
  transition: all ease-in-out 200ms;
}

.tag.active {
  background-color: #ff8000;
  color: white;
}

.tag-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block: 0.5rem;
}

.tag-bar-tag {
  cursor: pointer;
}

@media (max-width: 900px) {
  .tag-bar {
    display: block;
    gap: 0.4rem;
    font-size: 16px;
  }

  .tag-bar-tag {
    display: inline-block;
    margin-right: 0.4rem;
    margin-bottom: 0.4rem;
  }
}

</style>