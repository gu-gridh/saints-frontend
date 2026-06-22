import { ref, onMounted } from 'vue'

export function useFooterSettings() {
  const footer = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function loadFooter() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/cms/footer/')

      if (!response.ok) {
        throw new Error(`Could not load footer: ${response.status}`)
      }

      footer.value = await response.json()
    } catch (err) {
      error.value = err
      footer.value = null
    } finally {
      loading.value = false
    }
  }

  onMounted(loadFooter)

  return {
    footer,
    loading,
    error,
    reload: loadFooter,
  }
}
