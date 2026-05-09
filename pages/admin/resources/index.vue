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
const allResources = ref<Resource[]>([])
const isLoading = ref(false)

async function loadResources() {
  isLoading.value = true
  try {
    // Fetch all (admin can see inactive too via separate call)
    allResources.value = await $fetch<Resource[]>('/api/resources')
  } catch {
    allResources.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(loadResources)

const filteredResources = computed(() => {
  if (!search.value.trim()) return allResources.value
  const q = search.value.toLowerCase()
  return allResources.value.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      (r.description ?? '').toLowerCase().includes(q),
  )
})

async function toggleActive(resource: Resource) {
  try {
    await $fetch(`/api/resources/${resource.id}`, {
      method: 'PATCH',
      body: { is_active: !resource.is_active },
    })
    const idx = allResources.value.findIndex((r) => r.id === resource.id)
    if (idx !== -1) {
      allResources.value[idx] = { ...allResources.value[idx], is_active: !resource.is_active }
    }
  } catch (err) {
    console.error('Toggle failed:', err)
  }
}

const columns = [
  { key: 'id', label: 'ID' },
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
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">Resources</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ filteredResources.length }} resources</p>
      </div>
      <UButton to="/admin/resources/new" color="primary" icon="i-heroicons-plus-20-solid">
        Add Resource
      </UButton>
    </div>

    <UInput
      v-model="search"
      placeholder="Search resources..."
      icon="i-heroicons-magnifying-glass-20-solid"
      class="mb-4 max-w-sm"
    />

    <UTable
      :rows="filteredResources"
      :columns="columns"
      :loading="isLoading"
    >
      <template #communities-data="{ row }">
        <div class="flex flex-wrap gap-1 max-w-xs">
          <UBadge v-for="c in (row as Resource).communities.slice(0,3)" :key="c" color="blue" variant="subtle" size="xs">{{ c }}</UBadge>
          <span v-if="(row as Resource).communities.length > 3" class="text-xs text-gray-400">+{{ (row as Resource).communities.length - 3 }}</span>
        </div>
      </template>
      <template #topics-data="{ row }">
        <div class="flex flex-wrap gap-1 max-w-xs">
          <UBadge v-for="t in (row as Resource).topics.slice(0,2)" :key="t" color="green" variant="subtle" size="xs">{{ t }}</UBadge>
          <span v-if="(row as Resource).topics.length > 2" class="text-xs text-gray-400">+{{ (row as Resource).topics.length - 2 }}</span>
        </div>
      </template>
      <template #link-data="{ row }">
        <a v-if="(row as Resource).link" :href="(row as Resource).link ?? ''" target="_blank" class="text-primary-600 hover:underline text-xs truncate max-w-xs block">
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
          <UButton :to="`/admin/resources/${(row as Resource).id}`" size="xs" variant="ghost" color="gray">
            Edit
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            :color="(row as Resource).is_active ? 'red' : 'green'"
            @click="toggleActive(row as Resource)"
          >
            {{ (row as Resource).is_active ? 'Deactivate' : 'Activate' }}
          </UButton>
        </div>
      </template>
    </UTable>
  </UContainer>
</template>
