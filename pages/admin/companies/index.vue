<script setup lang="ts">
import type { Company } from '~/types/company'

interface AdminClaim {
  id: string
  company_id: string
  user_id: string
  verification_note: string | null
  status: string
  created_at: string
  companies: { name: string; sector: string | null } | null
  user_profiles: { full_name: string | null } | null
}

const user = useSupabaseUser()

onMounted(() => {
  const isAdmin =
    user.value?.user_metadata?.role === 'admin' ||
    user.value?.app_metadata?.role === 'admin'
  if (!isAdmin) navigateTo('/')
})

useSeoMeta({ title: 'Manage Companies · Admin' })

const selectedTab = ref(0)
const tabs = [{ label: 'Active Companies' }, { label: 'Pending Review' }, { label: 'Pending Claims' }]

const search = ref('')
const activeCompanies = ref<Company[]>([])
const pendingCompanies = ref<Company[]>([])
const claims = ref<AdminClaim[]>([])
const isLoadingActive = ref(false)
const isLoadingPending = ref(false)
const isLoadingClaims = ref(false)

async function loadActive() {
  isLoadingActive.value = true
  try {
    activeCompanies.value = await $fetch<Company[]>('/api/admin/companies')
  } catch {
    activeCompanies.value = []
  } finally {
    isLoadingActive.value = false
  }
}

async function loadPending() {
  isLoadingPending.value = true
  try {
    pendingCompanies.value = await $fetch<Company[]>('/api/admin/companies?pending=true')
  } catch {
    pendingCompanies.value = []
  } finally {
    isLoadingPending.value = false
  }
}

async function loadClaims() {
  isLoadingClaims.value = true
  try {
    claims.value = await $fetch<AdminClaim[]>('/api/admin/claims')
  } catch {
    claims.value = []
  } finally {
    isLoadingClaims.value = false
  }
}

async function approveClaim(claim: AdminClaim) {
  try {
    await $fetch(`/api/admin/claims/${claim.id}`, { method: 'PATCH', body: { action: 'approve' } })
    claims.value = claims.value.filter(c => c.id !== claim.id)
  } catch (err) {
    console.error('Approve claim failed:', err)
  }
}

async function rejectClaim(claim: AdminClaim) {
  try {
    await $fetch(`/api/admin/claims/${claim.id}`, { method: 'PATCH', body: { action: 'reject' } })
    claims.value = claims.value.filter(c => c.id !== claim.id)
  } catch (err) {
    console.error('Reject claim failed:', err)
  }
}

onMounted(() => {
  loadActive()
  loadPending()
  loadClaims()
})

const filteredActive = computed(() => {
  if (!search.value.trim()) return activeCompanies.value
  const q = search.value.toLowerCase()
  return activeCompanies.value.filter(
    c => c.name.toLowerCase().includes(q) || (c.sector ?? '').toLowerCase().includes(q),
  )
})

const filteredPending = computed(() => {
  if (!search.value.trim()) return pendingCompanies.value
  const q = search.value.toLowerCase()
  return pendingCompanies.value.filter(
    c => c.name.toLowerCase().includes(q) || (c.sector ?? '').toLowerCase().includes(q),
  )
})

async function approveCompany(company: Company) {
  try {
    await $fetch(`/api/companies/${company.id}`, {
      method: 'PATCH',
      body: { is_active: true, is_verified: true },
    })
    pendingCompanies.value = pendingCompanies.value.filter(c => c.id !== company.id)
    activeCompanies.value = [...activeCompanies.value, { ...company, is_active: true, is_verified: true }]
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    console.error('Approve failed:', err)
  }
}

async function deactivateCompany(company: Company) {
  try {
    await $fetch(`/api/companies/${company.id}`, {
      method: 'PATCH',
      body: { is_active: false },
    })
    activeCompanies.value = activeCompanies.value.filter(c => c.id !== company.id)
    pendingCompanies.value = [...pendingCompanies.value, { ...company, is_active: false }]
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    console.error('Deactivate failed:', err)
  }
}

async function deleteCompany(company: Company) {
  if (!confirm(`Delete "${company.name}"? This cannot be undone.`)) return
  try {
    await $fetch(`/api/companies/${company.id}`, { method: 'DELETE' })
    activeCompanies.value = activeCompanies.value.filter(c => c.id !== company.id)
    pendingCompanies.value = pendingCompanies.value.filter(c => c.id !== company.id)
  } catch (err) {
    console.error('Delete failed:', err)
  }
}

async function verifyCompany(company: Company) {
  try {
    await $fetch(`/api/companies/${company.id}`, {
      method: 'PATCH',
      body: { is_verified: true },
    })
    const idx = activeCompanies.value.findIndex(c => c.id === company.id)
    if (idx !== -1) activeCompanies.value[idx] = { ...activeCompanies.value[idx], is_verified: true }
  } catch (err) {
    console.error('Verify failed:', err)
  }
}

const activeColumns = [
  { key: 'name', label: 'Name' },
  { key: 'sector', label: 'Sector' },
  { key: 'stage', label: 'Stage' },
  { key: 'owner_email', label: 'Owner' },
  { key: 'is_verified', label: 'Verified' },
  { key: 'is_hiring', label: 'Hiring' },
  { key: 'actions', label: '' },
]

const pendingColumns = [
  { key: 'name', label: 'Name' },
  { key: 'sector', label: 'Sector' },
  { key: 'stage', label: 'Stage' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'actions', label: '' },
]
</script>

<template>
  <UContainer class="max-w-7xl py-10 px-4">
    <UButton to="/admin" variant="ghost" color="gray" size="sm" icon="i-heroicons-arrow-left-20-solid" class="mb-6">
      Back to Admin
    </UButton>

    <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Companies</h1>

    <UTabs :items="tabs" v-model="selectedTab" class="mb-4" />

    <UInput
      v-model="search"
      placeholder="Search companies..."
      icon="i-heroicons-magnifying-glass-20-solid"
      class="mb-4 max-w-sm"
    />

    <!-- Active Companies tab -->
    <div v-if="selectedTab === 0">
      <p class="text-sm text-gray-500 mb-4">{{ filteredActive.length }} active companies</p>
      <UTable :rows="filteredActive" :columns="activeColumns" :loading="isLoadingActive">
        <template #name-data="{ row }">
          <span class="font-medium text-gray-900">{{ (row as Company).name }}</span>
        </template>
        <template #sector-data="{ row }">
          <UBadge v-if="(row as Company).sector" color="blue" variant="subtle" size="xs">{{ (row as Company).sector }}</UBadge>
          <span v-else class="text-gray-400 text-xs">—</span>
        </template>
        <template #stage-data="{ row }">
          <UBadge v-if="(row as Company).stage" color="violet" variant="subtle" size="xs">{{ (row as Company).stage }}</UBadge>
          <span v-else class="text-gray-400 text-xs">—</span>
        </template>
        <template #owner_email-data="{ row }">
          <span v-if="(row as Company).owner_email" class="text-xs text-gray-700">{{ (row as Company).owner_email }}</span>
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
            <UButton :to="`/admin/companies/${(row as Company).id}`" size="xs" variant="ghost" color="gray">Edit</UButton>
            <UButton v-if="!(row as Company).is_verified" size="xs" variant="ghost" color="green" @click="verifyCompany(row as Company)">Verify</UButton>
            <UButton size="xs" variant="ghost" color="orange" @click="deactivateCompany(row as Company)">Deactivate</UButton>
            <UButton size="xs" variant="ghost" color="red" icon="i-heroicons-trash-20-solid" @click="deleteCompany(row as Company)" />
          </div>
        </template>
      </UTable>
    </div>

    <!-- Pending Review tab -->
    <div v-if="selectedTab === 1">
      <p class="text-sm text-gray-500 mb-4">{{ filteredPending.length }} companies awaiting review</p>
      <UTable :rows="filteredPending" :columns="pendingColumns" :loading="isLoadingPending">
        <template #name-data="{ row }">
          <span class="font-medium text-gray-900">{{ (row as Company).name }}</span>
        </template>
        <template #sector-data="{ row }">
          <UBadge v-if="(row as Company).sector" color="blue" variant="subtle" size="xs">{{ (row as Company).sector }}</UBadge>
          <span v-else class="text-gray-400 text-xs">—</span>
        </template>
        <template #stage-data="{ row }">
          <UBadge v-if="(row as Company).stage" color="violet" variant="subtle" size="xs">{{ (row as Company).stage }}</UBadge>
          <span v-else class="text-gray-400 text-xs">—</span>
        </template>
        <template #submitted-data="{ row }">
          <span class="text-xs text-gray-500">
            {{ new Date((row as Company).created_at ?? '').toLocaleDateString() }}
          </span>
        </template>
        <template #actions-data="{ row }">
          <div class="flex items-center gap-2">
            <UButton :to="`/admin/companies/${(row as Company).id}`" size="xs" variant="ghost" color="gray">Edit</UButton>
            <UButton size="xs" variant="ghost" color="green" @click="approveCompany(row as Company)">Approve</UButton>
            <UButton size="xs" variant="ghost" color="red" icon="i-heroicons-trash-20-solid" @click="deleteCompany(row as Company)" />
          </div>
        </template>
      </UTable>
    </div>

    <!-- Pending Claims tab -->
    <div v-if="selectedTab === 2">
      <div v-if="isLoadingClaims" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-gray-400 animate-spin" />
      </div>
      <div v-else-if="!claims.length" class="flex flex-col items-center py-16 text-center">
        <UIcon name="i-heroicons-inbox-20-solid" class="w-10 h-10 text-gray-300 mb-3" />
        <p class="text-gray-500">No pending claims at this time.</p>
      </div>
      <div v-else class="flex flex-col gap-4">
        <p class="text-sm text-gray-500">{{ claims.length }} pending claim{{ claims.length !== 1 ? 's' : '' }}</p>
        <div
          v-for="claim in claims"
          :key="claim.id"
          class="border border-gray-200 rounded-xl p-5 flex flex-col gap-3 bg-white shadow-sm"
        >
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p class="font-semibold text-gray-900 text-base">{{ claim.companies?.name ?? claim.company_id }}</p>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <UBadge v-if="claim.companies?.sector" color="blue" variant="subtle" size="xs">{{ claim.companies.sector }}</UBadge>
                <span class="text-xs text-gray-400">Submitted {{ new Date(claim.created_at).toLocaleDateString() }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <UButton size="sm" color="green" variant="soft" @click="approveClaim(claim)">Approve</UButton>
              <UButton size="sm" color="red" variant="soft" @click="rejectClaim(claim)">Reject</UButton>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <UIcon name="i-heroicons-user-20-solid" class="w-4 h-4 text-gray-400 shrink-0" />
            <span>{{ claim.user_profiles?.full_name ?? 'Unknown user' }}</span>
          </div>
          <div v-if="claim.verification_note" class="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed">
            {{ claim.verification_note }}
          </div>
          <div v-else class="text-xs text-gray-400 italic">No verification note provided.</div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
