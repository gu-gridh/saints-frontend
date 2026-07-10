<template>
  <Transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <slot name="header" />
          </div>

          <div class="modal-body">
            <slot name="body" />
          </div>

          <div class="modal-footer">
            <slot name="footer" />

            <button class="frmbtn" @click="close">
              {{ buttonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  buttonText: {
    type: String,
    default: 'Close',
  },
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-container {
  max-width: 600px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  margin: 20px 0;
  font-size: 0.9em;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  margin-top: 20px;
  text-align: right;
}

.frmbtn {
  padding: 10px 15px;
  background-color: #e8e8e8;
  color: black;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.frmbtn:hover {
  background-color: #dcdcdc;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(1.1);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

@media screen and (max-width: 600px) {
  .modal-container {
    width: 95%;
    max-width: none;
    padding: 15px;
    border-radius: 8px;
  }

  .modal-header,
  .modal-footer {
    padding: 10px;
  }

  .modal-body {
    margin: 0;
    padding: 10px;
  }

  .frmbtn {
    padding: 10px 12px;
    font-size: 0.9em;
  }
}
</style>