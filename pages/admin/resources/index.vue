<script setup lang="ts">
import type { Resource } from '~/types/resource'

const user = useSupabaseUser()

onMounted(() => {
  const isAdmin =
    user.value?.user_metadata?.role === 'admin' ||
    user.value?.app_metadata?.role === 'admin'
  if (!isAdmin) navigateTo('/')
})

useSeoMeta({ title: 'Manage Resources · Admin' })

const search = ref('')
const showPending = ref(false)
const allResources = ref<Resource[]>([])
const isLoading = ref(false)

async function loadResources() {
  isLoading.value = true
  try {
    const query = showPending.value ? { include_inactive: 'true' } : {}
    allResources.value = await $fetch<Resource[]>('/api/resources', { query })
  } catch {
    allResources.value = []
  } finally {
    isLoading.value = false
  }
}

watch(showPending, loadResources)
onMounted(loadResources)

const filteredResources = computed(() => {
  let list = allResources.value
  if (showPending.value) list = list.filter(r => !r.is_active)
  if (!search.value.trim()) return list
  const q = search.value.toLowerCase()
  return list.filter(
    r => r.title.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q),
  )
})

function truncate(str: string, n = 50) {
  return str.length > n ? str.slice(0, n) + '…' : str
}

async function toggleActive(resource: Resource) {
  try {
    await $fetch(`/api/resources/${resource.id}`, {
      method: 'PATCH',
      body: { is_active: !resource.is_active },
    })
    const idx = allResources.value.findIndex(r => r.id === resource.id)
    if (idx !== -1) allResources.value[idx] = { ...allResources.value[idx], is_active: !resource.is_active }
  } catch (err) {
    console.error('Toggle failed:', err)
  }
}

async function deleteResource(resource: Resource) {
  if (!confirm(`Delete "${resource.title}"? This cannot be undone.`)) return
  try {
    await $fetch(`/api/resources/${resource.id}`, { method: 'DELETE' })
    allResources.value = allResources.value.filter(r => r.id !== resource.id)
  } catch (err) {
    console.error('Delete failed:', err)
  }
}

const tableColumns = [
  { key: 'title', label: 'Title' },
  { key: 'communities', label: 'Communities' },
  { key: 'topics', label: 'Topics' },
  { key: 'link', label: 'Link' },
  { key: 'is_active', label: 'Active' },
  { key: 'actions', label: '' },
]
</script>

<template>
  <UContainer class="max-w-7xl py-10 px-4">
    <UButton to="/admin" variant="ghost" color="gray" size="sm" icon="i-heroicons-arrow-left-20-solid" class="mb-6">
      Back to Admin
    </UButton>

    <!-- Header -->
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">Resources</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ filteredResources.length }} resources</p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2">
          <UToggle v-model="showPending" size="sm" />
          <span class="text-sm text-gray-600">Show pending review</span>
        </div>
        <UButton to="/admin/resources/new" color="primary" icon="i-heroicons-plus-20-solid">
          Add Resource
        </UButton>
      </div>
    </div>

    <UInput
      v-model="search"
      placeholder="Search resources..."
      icon="i-heroicons-magnifying-glass-20-solid"
      class="mb-4 max-w-sm"
    />

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-gray-400 animate-spin" />
    </div>

    <template v-else>
      <!-- Mobile card list -->
      <div class="flex flex-col gap-3 md:hidden">
        <div
          v-for="resource in filteredResources"
          :key="resource.id"
          class="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3"
        >
          <div class="flex items-start justify-between gap-2">
            <span class="font-medium text-gray-900 text-sm leading-snug" :title="resource.title">
              {{ truncate(resource.title, 60) }}
            </span>
            <UBadge :color="resource.is_active ? 'green' : 'red'" variant="subtle" size="xs" class="shrink-0">
              {{ resource.is_active ? 'Active' : 'Inactive' }}
            </UBadge>
          </div>

          <div v-if="resource.communities?.length || resource.topics?.length" class="flex flex-wrap gap-1">
            <UBadge v-for="c in resource.communities.slice(0, 2)" :key="c" color="blue" variant="subtle" size="xs">{{ c }}</UBadge>
            <UBadge v-for="t in resource.topics.slice(0, 2)" :key="t" color="green" variant="subtle" size="xs">{{ t }}</UBadge>
          </div>

          <div class="flex items-center gap-2 pt-1 border-t border-gray-100">
            <UButton :to="`/admin/resources/${resource.id}`" size="xs" variant="ghost" color="gray">Edit</UButton>
            <UButton
              size="xs"
              variant="ghost"
              :color="resource.is_active ? 'red' : 'green'"
              @click="toggleActive(resource)"
            >
              {{ resource.is_active ? 'Deactivate' : 'Activate' }}
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              color="red"
              icon="i-heroicons-trash-20-solid"
              class="ml-auto"
              @click="deleteResource(resource)"
            />
          </div>
        </div>

        <p v-if="!filteredResources.length" class="text-center text-gray-400 py-12 text-sm">
          No resources found.
        </p>
      </div>

      <!-- Desktop table -->
      <div class="hidden md:block overflow-x-auto">
        <UTable :rows="filteredResources" :columns="tableColumns">
          <template #title-data="{ row }">
            <span class="block w-48" :title="(row as Resource).title">
              {{ truncate((row as Resource).title) }}
            </span>
          </template>
          <template #communities-data="{ row }">
            <div class="flex flex-wrap gap-1 max-w-[180px]">
              <UBadge v-for="c in (row as Resource).communities.slice(0, 3)" :key="c" color="blue" variant="subtle" size="xs">{{ c }}</UBadge>
              <span v-if="(row as Resource).communities.length > 3" class="text-xs text-gray-400">+{{ (row as Resource).communities.length - 3 }}</span>
            </div>
          </template>
          <template #topics-data="{ row }">
            <div class="flex flex-wrap gap-1 max-w-[160px]">
              <UBadge v-for="t in (row as Resource).topics.slice(0, 2)" :key="t" color="green" variant="subtle" size="xs">{{ t }}</UBadge>
              <span v-if="(row as Resource).topics.length > 2" class="text-xs text-gray-400">+{{ (row as Resource).topics.length - 2 }}</span>
            </div>
          </template>
          <template #link-data="{ row }">
            <a v-if="(row as Resource).link" :href="(row as Resource).link ?? ''" target="_blank" class="text-primary-600 hover:underline text-xs truncate w-36 block">
              {{ (row as Resource).link }}
            </a>
            <span v-else class="text-gray-400 text-xs">—</span>
          </template>
          <template #is_active-data="{ row }">
            <UBadge :color="(row as Resource).is_active ? 'green' : 'red'" variant="subtle" size="xs">
              {{ (row as Resource).is_active ? 'Active' : 'Inactive' }}
            </UBadge>
          </template>
          <template #actions-data="{ row }">
            <div class="flex items-center gap-2">
              <UButton :to="`/admin/resources/${(row as Resource).id}`" size="xs" variant="ghost" color="gray">Edit</UButton>
              <UButton
                size="xs"
                variant="ghost"
                :color="(row as Resource).is_active ? 'red' : 'green'"
                @click="toggleActive(row as Resource)"
              >
                {{ (row as Resource).is_active ? 'Deactivate' : 'Activate' }}
              </UButton>
              <UButton
                size="xs"
                variant="ghost"
                color="red"
                icon="i-heroicons-trash-20-solid"
                @click="deleteResource(row as Resource)"
              />
            </div>
          </template>
        </UTable>
      </div>
    </template>
  </UContainer>
</template>
