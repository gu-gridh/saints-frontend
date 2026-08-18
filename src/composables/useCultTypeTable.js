import { ref, onMounted } from 'vue'

export function useCultTypeTable() {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function loadCultTypeTable() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/culttypes-tree/')

      if (!response.ok) {
        throw new Error(
          `Could not load evidence types: ${response.status}`
        )
      }

      const data = await response.json()
      categories.value = data.results
    } catch (err) {
      error.value = err
      categories.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(loadCultTypeTable)

  return {
    categories,
    loading,
    error,
    reload: loadCultTypeTable,
  }
}