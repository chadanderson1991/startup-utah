<script setup lang="ts">
import { UTAH_COUNTIES, INDUSTRIES, COMMUNITIES, SECTORS, STAGES } from '~/lib/constants'
import { SECTOR_COLORS, SECTOR_COLOR_DEFAULT } from '~/lib/sector-colors'
import { useActiveBusiness } from '~/composables/useActiveBusiness'
import type { ProfileUpdate } from '~/types/profile'
import type { Company } from '~/types/company'

interface WatchlistItem {
  id: string
  company_id: string
  created_at: string
  companies: Company
}

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'My Profile · Startup State Utah' })

const route = useRoute()
const returnTo = computed(() => route.query.return as string | undefined)

const STAGE_LABELS: Record<string, string> = {
  idea: 'Just an idea',
  early: 'Early stage',
  growth: 'Growing',
  established: 'Established',
}

const isSaving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)

const {
  profile,
  businesses,
  savedActiveBusinessId: activeBusinessId,
  setActiveBusiness,
  refresh: refreshProfileAndBusinesses,
} = useActiveBusiness()

const { data: watchlistItems, refresh: refreshWatchlist } = await useFetch<WatchlistItem[]>('/api/watchlist')
const { toggleWatchlist } = useWatchlist()

async function removeFromWatchlist(companyId: string) {
  await toggleWatchlist(companyId)
  await refreshWatchlist()
}

// The composable populates lazily on the client; await so the form below
// seeds from real data instead of empty strings.
await refreshProfileAndBusinesses()

const form = reactive<ProfileUpdate>({
  full_name:          profile.value?.full_name ?? '',
  county:             profile.value?.county ?? '',
  industry:           profile.value?.industry ?? '',
  communities:        [...(profile.value?.communities ?? [])],
  bio:                profile.value?.bio ?? '',
  profile_type:       profile.value?.profile_type ?? 'entrepreneur',
  preferred_sectors:  [...(profile.value?.preferred_sectors ?? [])],
  preferred_stages:   [...(profile.value?.preferred_stages ?? [])],
  investment_thesis:  profile.value?.investment_thesis ?? null,
  investor_name:      profile.value?.investor_name ?? null,
})

const isInvestor = computed(() => form.profile_type === 'investor')

function toggleCommunity(c: string) {
  const list = (form.communities ?? []) as string[]
  const idx = list.indexOf(c)
  if (idx === -1) form.communities = [...list, c] as typeof form.communities
  else form.communities = list.filter(x => x !== c) as typeof form.communities
}

function toggleSector(s: string) {
  const list = form.preferred_sectors ?? []
  const idx = list.indexOf(s)
  if (idx === -1) form.preferred_sectors = [...list, s]
  else form.preferred_sectors = list.filter(x => x !== s)
}

function toggleStage(s: string) {
  const list = form.preferred_stages ?? []
  const idx = list.indexOf(s)
  if (idx === -1) form.preferred_stages = [...list, s]
  else form.preferred_stages = list.filter(x => x !== s)
}

async function saveProfile() {
  isSaving.value = true
  saveError.value = null
  saveSuccess.value = false
  try {
    await $fetch('/api/profile', { method: 'PATCH', body: form })
    await refreshProfileAndBusinesses()
    saveSuccess.value = true
    if (returnTo.value && form.full_name) {
      setTimeout(() => navigateTo(returnTo.value!), 800)
    } else {
      setTimeout(() => { saveSuccess.value = false }, 3000)
    }
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    saveError.value = e.data?.statusMessage ?? 'Failed to save.'
  } finally {
    isSaving.value = false
  }
}

async function deleteBusiness(id: string) {
  if (!confirm('Delete this business? This cannot be undone.')) return
  await $fetch(`/api/businesses/${id}`, { method: 'DELETE' })
  if (profile.value?.active_business_id === id) await setActiveBusiness(null)
  else await refreshProfileAndBusinesses()
}
</script>

<template>
  <UContainer class="max-w-4xl py-10 px-4">
    <h1 class="text-2xl font-extrabold text-gray-900 mb-8">My Profile</h1>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <!-- Profile form -->
      <div class="lg:col-span-3">
        <UCard>
          <template #header>
            <h2 class="font-semibold text-gray-800">Personal Information</h2>
            <p class="text-sm text-gray-500 mt-0.5">This helps the Navigator personalize its recommendations.</p>
          </template>

          <div class="flex flex-col gap-4">
            <UAlert
              v-if="returnTo"
              icon="i-heroicons-information-circle"
              color="blue"
              title="Profile required"
              description="Complete your profile to continue — you'll be redirected automatically after saving."
              class="mb-1"
            />
            <UAlert v-if="saveError" icon="i-heroicons-exclamation-triangle" color="red" :description="saveError" />
            <UAlert v-if="saveSuccess" icon="i-heroicons-check-circle" color="green" :description="returnTo ? 'Profile saved. Redirecting…' : 'Profile saved.'" />

            <!-- Profile type toggle -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-base font-bold transition-all"
                  :style="form.profile_type === 'entrepreneur'
                    ? 'background-color: var(--brand-green); border-color: var(--brand-green); color: #fff;'
                    : 'background-color: #fff; border-color: #d1d5db; color: #6b7280;'"
                  @click="form.profile_type = 'entrepreneur'"
                >
                  <span>🚀</span> I'm an Entrepreneur
                </button>
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-base font-bold transition-all"
                  :style="form.profile_type === 'investor'
                    ? 'background-color: var(--brand-green); border-color: var(--brand-green); color: #fff;'
                    : 'background-color: #fff; border-color: #d1d5db; color: #6b7280;'"
                  @click="form.profile_type = 'investor'"
                >
                  <span>💼</span> I'm an Investor
                </button>
              </div>
            </div>

            <UFormGroup label="Full Name">
              <UInput v-model="form.full_name" placeholder="Jane Smith" />
            </UFormGroup>

            <!-- Investor-specific fields -->
            <template v-if="isInvestor">
              <UFormGroup label="Organization / Fund Name">
                <UInput
                  :model-value="form.investor_name ?? ''"
                  placeholder="Acme Ventures"
                  @update:model-value="form.investor_name = $event || null"
                />
              </UFormGroup>

              <UFormGroup label="Investment Thesis" hint="What kinds of companies do you look for?">
                <UTextarea
                  :model-value="form.investment_thesis ?? ''"
                  placeholder="We invest in early-stage B2B software companies in the Mountain West..."
                  :rows="4"
                  :maxrows="5"
                  @update:model-value="form.investment_thesis = $event || null"
                />
              </UFormGroup>

              <UFormGroup label="Preferred Sectors">
                <div class="flex flex-wrap gap-2 mt-1">
                  <button
                    v-for="sector in SECTORS"
                    :key="sector"
                    type="button"
                    class="px-3 py-1.5 rounded-full border text-sm font-medium transition-all"
                    :class="form.preferred_sectors?.includes(sector)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-600 hover:border-blue-400'"
                    @click="toggleSector(sector)"
                  >
                    {{ sector }}
                  </button>
                </div>
              </UFormGroup>

              <UFormGroup label="Preferred Stages">
                <div class="flex flex-wrap gap-2 mt-1">
                  <button
                    v-for="stage in STAGES"
                    :key="stage"
                    type="button"
                    class="px-3 py-1.5 rounded-full border text-sm font-medium transition-all"
                    :class="form.preferred_stages?.includes(stage)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-600 hover:border-blue-400'"
                    @click="toggleStage(stage)"
                  >
                    {{ stage }}
                  </button>
                </div>
              </UFormGroup>
            </template>

            <!-- Entrepreneur-specific fields -->
            <template v-else>
              <div class="grid grid-cols-2 gap-4">
                <UFormGroup label="County">
                  <USelect
                    v-model="form.county"
                    :options="[{ label: 'Select...', value: '' }, ...UTAH_COUNTIES.map(c => ({ label: c, value: c }))]"
                  />
                </UFormGroup>
                <UFormGroup label="Industry">
                  <USelect
                    v-model="form.industry"
                    :options="[{ label: 'Select...', value: '' }, ...INDUSTRIES.map(i => ({ label: i, value: i }))]"
                  />
                </UFormGroup>
              </div>

              <UFormGroup label="Bio" hint="Brief background">
                <UTextarea v-model="form.bio" placeholder="I've been in retail for 10 years and want to start my own brand..." :rows="3" />
              </UFormGroup>

              <UFormGroup label="Community Identity" hint="Optional — unlocks targeted programs">
                <div class="flex flex-wrap gap-2 mt-1">
                  <button
                    v-for="c in COMMUNITIES.filter(x => x !== 'Any')"
                    :key="c"
                    type="button"
                    class="px-3 py-1.5 rounded-full border text-sm font-medium transition-all"
                    :class="(form.communities as string[] | undefined)?.includes(c)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-600 hover:border-blue-400'"
                    @click="toggleCommunity(c)"
                  >
                    {{ c }}
                  </button>
                </div>
              </UFormGroup>
            </template>
          </div>

          <template #footer>
            <UButton color="primary" :loading="isSaving" @click="saveProfile">
              Save Profile
            </UButton>
          </template>
        </UCard>
      </div>

      <!-- Right column: Businesses (entrepreneurs) OR Watchlist (investors) -->
      <div class="lg:col-span-2 flex flex-col gap-4">

        <!-- Entrepreneur: My Businesses -->
        <template v-if="!isInvestor">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-gray-800">My Businesses</h2>
            <UButton to="/profile/business/new" size="sm" color="primary" icon="i-heroicons-plus-20-solid">
              Add Business
            </UButton>
          </div>

          <div v-if="!businesses?.length" class="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center">
            No businesses yet. Add one so the Navigator can give you personalized step-by-step guidance.
          </div>

          <UCard
            v-for="biz in businesses"
            :key="biz.id"
            class="transition-all cursor-pointer"
            :class="activeBusinessId === biz.id ? 'shadow-md' : 'opacity-75 hover:opacity-100 hover:shadow-md'"
            :style="activeBusinessId === biz.id ? 'outline: 2px solid #3b82f6; outline-offset: 2px;' : ''"
            @click="setActiveBusiness(biz.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 truncate">{{ biz.name }}</p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ STAGE_LABELS[biz.stage] }} · Step {{ biz.journey_step }} of 19
                  <template v-if="biz.industry"> · {{ biz.industry }}</template>
                </p>
                <p v-if="biz.description" class="text-sm text-gray-600 mt-1 line-clamp-2">{{ biz.description }}</p>
              </div>
              <div class="flex gap-1 shrink-0" @click.stop>
                <UButton :to="`/profile/business/${biz.id}`" size="xs" variant="ghost" color="gray" icon="i-heroicons-pencil-square-20-solid" />
                <UButton size="xs" variant="ghost" color="red" icon="i-heroicons-trash-20-solid" @click="deleteBusiness(biz.id)" />
              </div>
            </div>
          </UCard>
        </template>

        <!-- Investor: Saved Companies (watchlist) -->
        <template v-else>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-gray-800">Saved Companies</h2>
            <NuxtLink
              to="/map"
              class="text-sm font-semibold transition-opacity hover:opacity-80"
              style="color: var(--brand-green-dark)"
            >
              Browse Map →
            </NuxtLink>
          </div>

          <div v-if="!watchlistItems?.length" class="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center">
            No saved companies yet. Browse the map and bookmark companies you want to track.
          </div>

          <div
            v-for="item in watchlistItems"
            :key="item.id"
            class="relative bg-white rounded-xl overflow-hidden"
            style="border: 1px solid #e5e7eb; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.07)"
          >
            <!-- Sector accent bar -->
            <div
              class="absolute top-0 left-0 bottom-0 w-1"
              :style="{ backgroundColor: SECTOR_COLORS[item.companies?.sector ?? ''] ?? SECTOR_COLOR_DEFAULT }"
            />
            <div class="pl-4 pr-3 py-3 flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 text-sm truncate">{{ item.companies?.name }}</p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ item.companies?.sector }}
                  <template v-if="item.companies?.stage"> · {{ item.companies.stage }}</template>
                  <template v-if="item.companies?.is_hiring"> · <span class="text-green-600 font-medium">Hiring</span></template>
                </p>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <NuxtLink
                  :to="`/company/${item.company_id}`"
                  class="text-xs font-semibold px-2 py-1 rounded transition-colors"
                  style="color: var(--brand-navy)"
                >
                  View
                </NuxtLink>
                <button
                  class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove"
                  @click="removeFromWatchlist(item.company_id)"
                >
                  <UIcon name="i-heroicons-x-mark-20-solid" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </template>

      </div>
    </div>
  </UContainer>
</template>
