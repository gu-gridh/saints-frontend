import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSaintsStore = defineStore('saints', () => {
    const mode = ref('') //places, saints, cults, manifestations

    const query = ref('')

    return { mode, query }
})


