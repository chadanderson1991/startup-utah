<script setup lang="ts">
import type { Company, CompanyClaim } from '~/types/company'

const user = useSupabaseUser()

onMounted(() => {
  const isAdmin =
    user.value?.user_metadata?.role === 'admin' ||
    user.value?.app_metadata?.role === 'admin'
  if (!isAdmin) navigateTo('/')
})

useSeoMeta({ title: 'Manage Companies · Admin' })

// Tabs
const selectedTab = ref(0)
const tabs = [{ label: 'Companies' }, { label: 'Pending Claims' }]

const companies = ref<Company[]>([])
const claims = ref<(CompanyClaim & { company_name?: string })[]>([])
const isLoadingCompanies = ref(false)
const isLoadingClaims = ref(false)

async function loadCompanies() {
  isLoadingCompanies.value = true
  try {
    companies.value = await $fetch<Company[]>('/api/companies')
  } catch {
    companies.value = []
  } finally {
    isLoadingCompanies.value = false
  }
}

async function loadClaims() {
  isLoadingClaims.value = true
  try {
    // We don't have a dedicated claims endpoint, so we use the admin supabase client via a custom route
    // For now, list from the companies with claimed_by set
    // Note: in a real setup you'd have GET /api/admin/claims
    claims.value = []
  } finally {
    isLoadingClaims.value = false
  }
}

onMounted(() => {
  loadCompanies()
  loadClaims()
})

async function approveCompany(company: Company) {
  try {
    await $fetch(`/api/companies/${company.id}`, {
      method: 'PATCH',
      body: { is_verified: true },
    })
    const idx = companies.value.findIndex((c) => c.id === company.id)
    if (idx !== -1) {
      companies.value[idx] = { ...companies.value[idx], is_verified: true }
    }
  } catch (err) {
    console.error('Approve failed:', err)
  }
}

const companyColumns = [
  { key: 'name', label: 'Name' },
  { key: 'sector', label: 'Sector' },
  { key: 'stage', label: 'Stage' },
  { key: 'is_verified', label: 'Verified' },
  { key: 'is_hiring', label: 'Hiring' },
  { key: 'actions', label: '' },
]
</script>

<template>
  <UContainer class="max-w-7xl py-10 px-4">
    <h1 class="text-2xl font-extrabold text-gray-900 mb-6">Companies</h1>

    <UTabs :items="tabs" v-model="selectedTab" class="mb-6" />

    <!-- Companies tab -->
    <div v-if="selectedTab === 0">
      <UTable
        :rows="companies"
        :columns="companyColumns"
        :loading="isLoadingCompanies"
      >
        <template #sector-data="{ row }">
          <UBadge v-if="(row as Company).sector" color="blue" variant="subtle" size="xs">
            {{ (row as Company).sector }}
          </UBadge>
          <span v-else class="text-gray-400 text-xs">—</span>
        </template>
        <template #stage-data="{ row }">
          <UBadge v-if="(row as Company).stage" color="violet" variant="subtle" size="xs">
            {{ (row as Company).stage }}
          </UBadge>
          <span v-else class="text-gray-400 text-xs">—</span>
        </template>
        <template #is_verified-data="{ row }">
          <UBadge :color="(row as Company).is_verified ? 'green' : 'yellow'" variant="subtle" size="xs">
            {{ (row as Company).is_verified ? 'Verified' : 'Unverified' }}
          </UBadge>
        </template>
        <template #is_hiring-data="{ row }">
          <UBadge v-if="(row as Company).is_hiring" color="green" variant="solid" size="xs">Hiring</UBadge>
          <span v-else class="text-gray-400 text-xs">—</span>
        </template>
        <template #actions-data="{ row }">
          <div class="flex items-center gap-2">
            <UButton :to="`/admin/companies/${(row as Company).id}`" size="xs" variant="ghost" color="gray">
              Edit
            </UButton>
            <UButton
              v-if="!(row as Company).is_verified"
              size="xs"
              variant="ghost"
              color="green"
              @click="approveCompany(row as Company)"
            >
              Verify
            </UButton>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Pending Claims tab -->
    <div v-if="selectedTab === 1">
      <div v-if="isLoadingClaims" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-gray-400 animate-spin" />
      </div>
      <div v-else-if="!claims.length" class="flex flex-col items-center py-16 text-center">
        <UIcon name="i-heroicons-inbox-20-solid" class="w-10 h-10 text-gray-300 mb-3" />
        <p class="text-gray-500">No pending claims at this time.</p>
      </div>
      <div v-else class="flex flex-col gap-4">
        <UCard
          v-for="claim in claims"
          :key="claim.id"
          class="flex items-start justify-between gap-4"
        >
          <div>
            <p class="font-medium text-gray-900">{{ claim.company_name ?? claim.company_id }}</p>
            <p class="text-xs text-gray-500 mt-0.5">User: {{ claim.user_id }}</p>
            <p v-if="claim.verification_note" class="text-sm text-gray-600 mt-1">
              "{{ claim.verification_note }}"
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <UBadge color="yellow" variant="subtle" size="xs">Pending</UBadge>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
