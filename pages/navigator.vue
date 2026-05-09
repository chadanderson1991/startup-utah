<script setup lang="ts">
import type { Resource, ResourceFilters } from '~/types/resource'
import type { UserProfile, Business } from '~/types/profile'

useSeoMeta({
  title: 'Find Your Resources · Startup State Utah',
  description: 'Browse 200+ Utah state resources for founders and entrepreneurs.',
})

const user = useSupabaseUser()
const { resources, filters, isLoading, fetchResources } = useResources()

const isAdmin = computed(
  () =>
    user.value?.user_metadata?.role === 'admin' ||
    user.value?.app_metadata?.role === 'admin',
)

const showFormModal = ref(false)

function downloadCsv(data: Resource[], filename: string) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const headers = ['Title', 'Description', 'Link', 'Email', 'Communities', 'Industries', 'Counties', 'Topics']
  const rows = data.map(r => [
    escape(r.title),
    escape(r.description ?? ''),
    r.link ?? '',
    r.email ?? '',
    escape(r.communities.join(', ')),
    escape(r.industries.join(', ')),
    escape(r.locations.join(', ')),
    escape(r.topics.join(', ')),
  ].join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const profile = ref<UserProfile | null>(null)
const activeBusiness = ref<Business | null>(null)
const allResources = ref<Resource[]>([])
const profileLoading = ref(false)

onMounted(async () => {
  if (user.value) {
    profileLoading.value = true
    const [profileData] = await Promise.all([
      $fetch<UserProfile>('/api/profile').catch(() => null),
      fetchResources(),
      $fetch<Resource[]>('/api/resources').catch(() => []).then(d => { allResources.value = d }),
    ])
    profile.value = profileData
    if (profileData?.active_business_id) {
      activeBusiness.value = await $fetch<Business>(
        `/api/businesses/${profileData.active_business_id}`,
      ).catch(() => null)
    }
    profileLoading.value = false
  } else {
    fetchResources()
  }
})

function onFiltersUpdate(newFilters: ResourceFilters) {
  filters.value = newFilters
  fetchResources()
}

function onResourceSubmitted(resource: Resource) {
  if (isAdmin.value) {
    // Admin submissions are live immediately — add to lists
    resources.value = [resource, ...resources.value]
    allResources.value = [resource, ...allResources.value]
  }
  // For regular users it's pending review; the success screen in the modal is feedback enough
}

function scoreResource(r: Resource): number {
  let score = 0
  const industries: string[] = [
    ...(profile.value?.industry ? [profile.value.industry] : []),
    ...(activeBusiness.value?.industry ? [activeBusiness.value.industry] : []),
  ]
  const communities = profile.value?.communities ?? []
  const county = profile.value?.county ?? activeBusiness.value?.county ?? null

  for (const ind of industries) {
    if (r.industries.includes(ind)) score += 3
  }
  for (const com of communities) {
    if (r.communities.includes(com)) score += 2
  }
  if (county && r.locations.includes(county)) score += 1
  return score
}

const suggestedResources = computed<Resource[]>(() => {
  if (!user.value || !profile.value || allResources.value.length === 0) return []
  const hasContext =
    !!profile.value.industry ||
    (profile.value.communities?.length ?? 0) > 0 ||
    !!profile.value.county ||
    !!activeBusiness.value?.industry ||
    !!activeBusiness.value?.county
  if (!hasContext) return []

  return [...allResources.value]
    .map(r => ({ r, score: scoreResource(r) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ r }) => r)
})

const hasActiveFilters = computed(() =>
  !!(
    filters.value.search ||
    filters.value.communities.length ||
    filters.value.industries.length ||
    filters.value.locations.length ||
    filters.value.topics.length
  ),
)

const visibleSuggestions = computed<Resource[]>(() => {
  if (suggestedResources.value.length === 0) return []
  if (!hasActiveFilters.value) return suggestedResources.value
  const filteredIds = new Set(resources.value.map(r => r.id))
  return suggestedResources.value.filter(r => filteredIds.has(r.id))
})

const nonSuggestedResources = computed<Resource[]>(() => {
  if (visibleSuggestions.value.length === 0) return resources.value
  const suggestedIds = new Set(visibleSuggestions.value.map(r => r.id))
  return resources.value.filter(r => !suggestedIds.has(r.id))
})

const displayName = computed(() => {
  if (profile.value?.full_name) return profile.value.full_name.split(' ')[0]
  return user.value?.email?.split('@')[0] ?? null
})

const showProfilePrompt = computed(() =>
  !!user.value &&
  !profileLoading.value &&
  profile.value !== null &&
  suggestedResources.value.length === 0,
)
</script>

<template>
  <div>
    <!-- Hero -->
    <section
      class="relative text-white py-14 px-4"
      style="background-color: var(--brand-navy)"
    >
      <UContainer class="max-w-7xl">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span
              class="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full mb-4"
              style="background-color: var(--brand-green-bright); color: #052e16"
            >
              Utah Resources
            </span>
            <h1 class="text-4xl font-extrabold leading-tight">
              Find Your Resources
            </h1>
            <p class="mt-2 text-lg max-w-xl" style="color: #a8b2d1">
              <template v-if="displayName">
                Welcome back, {{ displayName }}. Browse state programs, funding sources, and support services.
              </template>
              <template v-else>
                Browse state programs, funding sources, and support services tailored to Utah entrepreneurs.
              </template>
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <!-- Suggest / Add resource -->
            <UButton
              v-if="user"
              icon="i-heroicons-plus-20-solid"
              style="background-color: var(--brand-green-bright); color: #052e16;"
              @click="showFormModal = true"
            >
              {{ isAdmin ? 'Add Resource' : 'Suggest a Resource' }}
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Horizontal filter bar -->
    <div class="bg-white border-b border-gray-200 shadow-sm sticky top-16 lg:top-[112px] z-20">
      <UContainer class="max-w-7xl">
        <NavigatorResourceFilters
          :model-value="filters"
          @update:model-value="onFiltersUpdate"
          @download-filtered="downloadCsv(resources, 'utah-resources-filtered.csv')"
          @download-all="downloadCsv(allResources.length ? allResources : resources, 'utah-resources-all.csv')"
        />
      </UContainer>
    </div>

    <!-- Content -->
    <div style="background-color: #f7f9fc" class="min-h-screen">
      <UContainer class="max-w-7xl py-8 px-4">

        <!-- Profile prompt for logged-in users with no profile data -->
        <div
          v-if="showProfilePrompt"
          class="mb-8 rounded-xl border p-5 flex items-center gap-4"
          style="background-color: #eff8f3; border-color: var(--brand-green)"
        >
          <UIcon name="i-heroicons-sparkles-20-solid" class="w-6 h-6 shrink-0" style="color: var(--brand-green)" />
          <div class="flex-1">
            <p class="font-semibold text-gray-900">Get personalized resource suggestions</p>
            <p class="text-sm text-gray-600 mt-0.5">Complete your profile with your industry, county, and communities to see resources tailored to you.</p>
          </div>
          <UButton to="/profile" size="sm" style="background-color: var(--brand-green-dark); color: white;">
            Complete Profile
          </UButton>
        </div>

        <!-- Suggested for You -->
        <section v-if="visibleSuggestions.length" class="mb-12">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-1 h-6 rounded-full" style="background-color: var(--brand-green)" />
            <h2 class="text-xl font-bold" style="color: var(--brand-navy)">
              Suggested for You
            </h2>
            <span
              class="text-xs font-semibold px-2.5 py-1 rounded-full"
              style="background-color: var(--brand-green-bright); color: #052e16"
            >
              {{ hasActiveFilters ? 'Matching your filters' : 'Based on your profile' }}
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <NavigatorResourceCard
              v-for="resource in visibleSuggestions"
              :key="`sug-${resource.id}`"
              :resource="resource"
              :suggested="true"
            />
          </div>
        </section>

        <!-- All Resources -->
        <section>
          <div v-if="visibleSuggestions.length" class="flex items-center gap-3 mb-5">
            <div class="w-1 h-6 rounded-full bg-gray-300" />
            <h2 class="text-xl font-bold text-gray-800">All Resources</h2>
          </div>
          <NavigatorResourceGrid :resources="nonSuggestedResources" :is-loading="isLoading" />
        </section>
      </UContainer>
    </div>

    <ChatbotChatWidget />

    <!-- Suggest / Add resource modal -->
    <NavigatorResourceFormModal
      v-model="showFormModal"
      @submitted="onResourceSubmitted"
    />
  </div>
</template>
