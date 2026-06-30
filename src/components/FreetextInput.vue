<template>
  <form @submit.prevent>
    <input
      type="search"
      :value="modelValue"
      @input="onChange"
      class="frminp"
      :placeholder="`Search ${mode}`"
    />
  </form>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const route = useRoute();

const mode = computed(() => route.name);

function debounce(callback, limit) {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(...args);
    }, limit);
  };
}

const onChange = debounce((event) => {
  emit("update:modelValue", event.target.value);
}, 500);
</script>

<style scoped>
input {
  margin-block: 0.2rem;
}

form input:placeholder-shown + button {
  opacity: 0;
  pointer-events: none;
}

form button {
  position: absolute;
  border: none;
  display: block;
  width: 15px;
  height: 15px;
  line-height: 16px;
  font-size: 12px;
  border-radius: 50%;
  top: 0;
  bottom: 0;
  right: 5px;
  margin: auto;
  background: #ddd;
  padding: 0;
  outline: none;
  cursor: pointer;
  transition: 0.1s;
}
</style>