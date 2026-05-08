<script setup lang="ts">
const user = useSupabaseUser()

// Guard: redirect non-admin users
onMounted(() => {
  const isAdmin =
    user.value?.user_metadata?.role === 'admin' ||
    user.value?.app_metadata?.role === 'admin'
  if (!isAdmin) {
    navigateTo('/')
  }
})

useSeoMeta({ title: 'Admin Dashboard · Startup State Utah' })

// Fetch basic stats
const { data: resourcesData } = await useFetch('/api/resources', { query: { _all: '1' } })
const { data: companiesData } = await useFetch('/api/companies')

const totalResources = computed(() => (resourcesData.value as unknown[])?.length ?? 0)
const totalCompanies = computed(() => (companiesData.value as unknown[])?.length ?? 0)
</script>

<template>
  <UContainer class="max-w-5xl py-10 px-4">
    <h1 class="text-2xl font-extrabold text-gray-900 mb-8">Admin Dashboard</h1>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
      <UCard>
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <UIcon name="i-heroicons-document-text-20-solid" class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ totalResources }}</p>
            <p class="text-sm text-gray-500">Total Resources</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
            <UIcon name="i-heroicons-building-office-20-solid" class="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ totalCompanies }}</p>
            <p class="text-sm text-gray-500">Total Companies</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
            <UIcon name="i-heroicons-clock-20-solid" class="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">—</p>
            <p class="text-sm text-gray-500">Pending Claims</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Quick links -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <h2 class="font-semibold text-gray-900">Resources</h2>
        </template>
        <p class="text-sm text-gray-500 mb-4">
          Manage startup resources, add new entries, and toggle visibility.
        </p>
        <div class="flex gap-3">
          <UButton to="/admin/resources" color="primary" size="sm">
            Manage Resources
          </UButton>
          <UButton to="/admin/resources/new" variant="outline" color="gray" size="sm">
            Add New
          </UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold text-gray-900">Companies</h2>
        </template>
        <p class="text-sm text-gray-500 mb-4">
          Review company listings, verify profiles, and approve claims.
        </p>
        <div class="flex gap-3">
          <UButton to="/admin/companies" color="primary" size="sm">
            Manage Companies
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
