import { ref, computed, watch } from 'vue'
import type { UserProfile } from '~/types/profile'
import type { Company } from '~/types/company'

// Module-scoped: every caller of useActiveBusiness() shares one source of truth.
// Mirrors the pattern used in useChat.ts.
const profile = ref<UserProfile | null>(null)
const businesses = ref<Company[]>([])
const hasLoaded = ref(false)
let inFlight: Promise<void> | null = null
let isInitialized = false

async function refreshAll(authed: boolean): Promise<void> {
  if (!authed) {
    profile.value = null
    businesses.value = []
    hasLoaded.value = false
    return
  }
  if (inFlight) return inFlight
  inFlight = (async () => {
    try {
      const [p, b] = await Promise.all([
        $fetch<UserProfile>('/api/profile'),
        $fetch<Company[]>('/api/businesses'),
      ])
      profile.value = p
      businesses.value = b
      hasLoaded.value = true
    } catch (e) {
      console.error('useActiveBusiness: refresh failed', e)
    } finally {
      inFlight = null
    }
  })()
  return inFlight
}

// Resolves once the initial load for the current auth state has completed.
// If a fetch is in flight, awaits it; if data is already loaded, resolves
// immediately; if loading hasn't started, kicks one off. Safe to call from
// any consumer that needs to wait for business context (e.g. before fetching
// a personalized greeting) without forcing a re-fetch.
async function ensureLoaded(authed: boolean): Promise<void> {
  if (!authed) return
  if (hasLoaded.value) return
  if (inFlight) return inFlight
  return refreshAll(true)
}

export const useActiveBusiness = () => {
  const user = useSupabaseUser()

  // Run once globally on the client: kick off initial load and watch for auth changes.
  // The persistent chatbot mounts before Supabase resolves the session, so the watcher
  // is what guarantees we fetch as soon as the user becomes available.
  if (!isInitialized && import.meta.client) {
    isInitialized = true
    if (user.value) refreshAll(true)
    watch(user, (val) => { refreshAll(!!val) })
  }

  // Raw saved value — matches how the profile page treats activeBusinessId
  // (no implicit fallback; null if nothing is saved).
  const savedActiveBusinessId = computed<string | null>({
    get: () => profile.value?.active_business_id ?? null,
    set: (id) => { if (profile.value) profile.value.active_business_id = id },
  })

  // Effective business — saved one if it exists, else first business. This is what
  // consumers like the chatbot want for "which business is the user working on".
  const activeBusiness = computed<Company | null>(() => {
    if (!user.value) return null
    const list = businesses.value
    if (!list.length) return null
    const saved = profile.value?.active_business_id
    return list.find(b => b.id === saved) ?? list[0]
  })

  async function setActiveBusiness(id: string | null) {
    if (profile.value) profile.value.active_business_id = id
    await $fetch('/api/profile', { method: 'PATCH', body: { active_business_id: id } })
  }

  return {
    profile,
    businesses,
    savedActiveBusinessId,
    activeBusiness,
    setActiveBusiness,
    refresh: () => refreshAll(!!user.value),
    ensureLoaded: () => ensureLoaded(!!user.value),
  }
}
