<script setup lang="ts">
import { COMMUNITIES, INDUSTRIES, UTAH_COUNTIES, TOPICS } from '~/lib/constants'
import type { Resource } from '~/types/resource'

const route = useRoute()
const router = useRouter()
const user = useSupabaseUser()

onMounted(() => {
  const isAdmin =
    user.value?.user_metadata?.role === 'admin' ||
    user.value?.app_metadata?.role === 'admin'
  if (!isAdmin) navigateTo('/')
})

const isNew = computed(() => route.params.id === 'new')

useSeoMeta({
  title: computed(() => (isNew.value ? 'New Resource · Admin' : 'Edit Resource · Admin')),
})

interface FormState {
  title: string
  description: string
  link: string
  email: string
  communities: string[]
  industries: string[]
  locations: string[]
  topics: string[]
  is_active: boolean
}

const form = reactive<FormState>({
  title: '',
  description: '',
  link: '',
  email: '',
  communities: [],
  industries: [],
  locations: [],
  topics: [],
  is_active: true,
})

const isSaving = ref(false)
const isDeleting = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const showDeleteConfirm = ref(false)

// Load existing resource
if (!isNew.value) {
  const { data } = await useFetch<Resource>(`/api/resources/${route.params.id}`)
  if (data.value) {
    form.title = data.value.title
    form.description = data.value.description ?? ''
    form.link = data.value.link ?? ''
    form.email = data.value.email ?? ''
    form.communities = data.value.communities
    form.industries = data.value.industries
    form.locations = data.value.locations
    form.topics = data.value.topics
    form.is_active = data.value.is_active
  }
}

async function handleSave() {
  if (!form.title.trim()) return
  isSaving.value = true
  successMessage.value = null
  errorMessage.value = null
  try {
    const payload = {
      title: form.title,
      description: form.description || null,
      link: form.link || null,
      email: form.email || null,
      communities: form.communities,
      industries: form.industries,
      locations: form.locations,
      topics: form.topics,
      is_active: form.is_active,
    }
    if (isNew.value) {
      const created = await $fetch<Resource>('/api/resources', {
        method: 'POST',
        body: payload,
      })
      router.replace(`/admin/resources/${created.id}`)
      successMessage.value = 'Resource created.'
    } else {
      await $fetch(`/api/resources/${route.params.id}`, {
        method: 'PATCH',
        body: payload,
      })
      successMessage.value = 'Saved successfully.'
    }
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    errorMessage.value = e.data?.statusMessage ?? 'Save failed.'
  } finally {
    isSaving.value = false
  }
}

async function handleDelete() {
  isDeleting.value = true
  try {
    await $fetch(`/api/resources/${route.params.id}`, { method: 'DELETE' })
    router.push('/admin/resources')
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    errorMessage.value = e.data?.statusMessage ?? 'Delete failed.'
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <UContainer class="max-w-2xl py-10 px-4">
    <UButton to="/admin/resources" variant="ghost" color="gray" size="sm" icon="i-heroicons-arrow-left-20-solid" class="mb-6">
      Back to Resources
    </UButton>

    <h1 class="text-2xl font-extrabold text-gray-900 mb-6">
      {{ isNew ? 'New Resource' : 'Edit Resource' }}
    </h1>

    <UAlert v-if="successMessage" icon="i-heroicons-check-circle" color="green" :description="successMessage" class="mb-4" />
    <UAlert v-if="errorMessage" icon="i-heroicons-exclamation-triangle" color="red" :description="errorMessage" class="mb-4" />

    <div class="flex flex-col gap-5">
      <UFormGroup label="Title" required>
        <UInput v-model="form.title" placeholder="Resource title" />
      </UFormGroup>

      <UFormGroup label="Description">
        <UTextarea v-model="form.description" :rows="3" placeholder="Describe this resource..." />
      </UFormGroup>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <UFormGroup label="Link">
          <UInput v-model="form.link" type="url" placeholder="https://..." />
        </UFormGroup>
        <UFormGroup label="Email">
          <UInput v-model="form.email" type="email" placeholder="contact@example.com" />
        </UFormGroup>
      </div>

      <UFormGroup label="Communities">
        <USelectMenu v-model="form.communities" :options="COMMUNITIES" multiple placeholder="Select communities" />
      </UFormGroup>

      <UFormGroup label="Industries">
        <USelectMenu v-model="form.industries" :options="INDUSTRIES" multiple placeholder="Select industries" />
      </UFormGroup>

      <UFormGroup label="Locations (Counties)">
        <USelectMenu v-model="form.locations" :options="UTAH_COUNTIES" multiple placeholder="Select counties" searchable />
      </UFormGroup>

      <UFormGroup label="Topics">
        <USelectMenu v-model="form.topics" :options="TOPICS" multiple placeholder="Select topics" />
      </UFormGroup>

      <div class="flex items-center gap-3">
        <UToggle v-model="form.is_active" />
        <span class="text-sm font-medium text-gray-700">Active (visible to users)</span>
      </div>

      <div class="flex items-center justify-between pt-2">
        <UButton color="primary" size="lg" :loading="isSaving" @click="handleSave">
          {{ isNew ? 'Create Resource' : 'Save Changes' }}
        </UButton>
        <UButton
          v-if="!isNew"
          color="red"
          variant="ghost"
          size="sm"
          @click="showDeleteConfirm = true"
        >
          Delete
        </UButton>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <UModal v-model="showDeleteConfirm">
      <UCard>
        <template #header>
          <h3 class="font-semibold text-gray-900">Confirm Delete</h3>
        </template>
        <p class="text-gray-600">
          This will deactivate the resource "<strong>{{ form.title }}</strong>". It won't be shown to users. Continue?
        </p>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton variant="ghost" color="gray" @click="showDeleteConfirm = false">Cancel</UButton>
            <UButton color="red" :loading="isDeleting" @click="handleDelete">Delete</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </UContainer>
</template>
