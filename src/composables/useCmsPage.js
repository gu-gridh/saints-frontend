import { ref, watch } from 'vue'

export function useCmsPage(slug) {
  const page = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function loadPage() {
    if (!slug.value) return

    loading.value = true
    error.value = null
    page.value = null

    try {
      const response = await fetch(
        `/api/cms/content-pages/${encodeURIComponent(slug.value)}/`
      )

      if (response.status === 404) {
        page.value = null
        return
      }

      if (!response.ok) {
        throw new Error(`Could not load CMS page: ${response.status}`)
      }

      page.value = await response.json()
    } catch (err) {
      error.value = err
      page.value = null
    } finally {
      loading.value = false
    }
  }

  watch(slug, loadPage, { immediate: true })

  return {
    page,
    loading,
    error,
    reload: loadPage,
  }
}