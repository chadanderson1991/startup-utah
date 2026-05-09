import { ref } from 'vue'

// Module-level state so all callers share the same watchlist instance
const watchlistedIds = ref<Set<string>>(new Set())
const isLoading = ref(false)

interface WatchlistResponse {
  company_id: string
}

async function fetchWatchlist(): Promise<void> {
  isLoading.value = true
  try {
    const data = await $fetch<WatchlistResponse[]>('/api/watchlist')
    watchlistedIds.value = new Set(data.map((item) => item.company_id))
  } catch (err) {
    console.error('Failed to fetch watchlist:', err)
  } finally {
    isLoading.value = false
  }
}

async function toggleWatchlist(companyId: string): Promise<void> {
  const wasWatchlisted = watchlistedIds.value.has(companyId)

  // Optimistic update
  if (wasWatchlisted) {
    watchlistedIds.value = new Set([...watchlistedIds.value].filter((id) => id !== companyId))
  } else {
    watchlistedIds.value = new Set([...watchlistedIds.value, companyId])
  }

  try {
    if (wasWatchlisted) {
      await $fetch(`/api/watchlist/${companyId}`, { method: 'DELETE' })
    } else {
      await $fetch(`/api/watchlist/${companyId}`, { method: 'POST' })
    }
  } catch (err) {
    console.error('Failed to toggle watchlist:', err)
    // Revert optimistic change on error
    if (wasWatchlisted) {
      watchlistedIds.value = new Set([...watchlistedIds.value, companyId])
    } else {
      watchlistedIds.value = new Set([...watchlistedIds.value].filter((id) => id !== companyId))
    }
  }
}

function isWatchlisted(companyId: string): boolean {
  return watchlistedIds.value.has(companyId)
}

export const useWatchlist = () => ({
  watchlistedIds,
  isLoading,
  fetchWatchlist,
  toggleWatchlist,
  isWatchlisted,
})
