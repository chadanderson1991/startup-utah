<script setup lang="ts">
import { COMMUNITIES, INDUSTRIES, UTAH_COUNTIES, TOPICS } from '~/lib/constants'
import type { Resource } from '~/types/resource'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submitted', resource: Resource): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const form = reactive({
  title: '',
  description: '',
  link: '',
  email: '',
  communities: [] as string[],
  industries: [] as string[],
  locations: [] as string[],
  topics: [] as string[],
})

const isSaving = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

function reset() {
  form.title = ''
  form.description = ''
  form.link = ''
  form.email = ''
  form.communities = []
  form.industries = []
  form.locations = []
  form.topics = []
  error.value = null
  success.value = false
}

watch(isOpen, (v) => { if (!v) reset() })

async function submit() {
  if (!form.title.trim()) {
    error.value = 'Title is required.'
    return
  }
  isSaving.value = true
  error.value = null
  try {
    const data = await $fetch<Resource>('/api/resources/suggest', {
      method: 'POST',
      body: {
        title: form.title.trim(),
        description: form.description || null,
        link: form.link || null,
        email: form.email || null,
        communities: form.communities,
        industries: form.industries,
        locations: form.locations,
        topics: form.topics,
      },
    })
    success.value = true
    emit('submitted', data)
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    error.value = e.data?.statusMessage ?? 'Submission failed. Please try again.'
  } finally {
    isSaving.value = false
  }
}

const communityOptions = COMMUNITIES.filter(c => c !== 'Any')
</script>

<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold" style="color: var(--brand-navy)">Suggest a Resource</h2>
            <p class="text-sm text-gray-500 mt-0.5">
              Your suggestion will be reviewed before going live.
            </p>
          </div>
          <UButton icon="i-heroicons-x-mark-20-solid" variant="ghost" color="gray" @click="isOpen = false" />
        </div>
      </template>

      <!-- Success state -->
      <div v-if="success" class="py-8 flex flex-col items-center text-center gap-4">
        <div
          class="w-14 h-14 rounded-full flex items-center justify-center"
          style="background-color: #eff8f3"
        >
          <UIcon name="i-heroicons-check-20-solid" class="w-7 h-7" style="color: var(--brand-green)" />
        </div>
        <div>
          <p class="font-semibold text-gray-900 text-lg">Thank you!</p>
          <p class="text-sm text-gray-500 mt-1">Your resource suggestion has been submitted for review.</p>
        </div>
        <UButton
          style="background-color: var(--brand-green-dark); color: white;"
          @click="isOpen = false"
        >
          Done
        </UButton>
      </div>

      <!-- Form -->
      <div v-else class="flex flex-col gap-4">
        <UAlert
          v-if="error"
          icon="i-heroicons-exclamation-triangle-20-solid"
          color="red"
          variant="subtle"
          :description="error"
        />

        <UFormGroup label="Resource name" required>
          <UInput v-model="form.title" placeholder="e.g. Utah SBDC Business Consulting" />
        </UFormGroup>

        <UFormGroup label="Description">
          <UTextarea
            v-model="form.description"
            :rows="3"
            placeholder="Briefly describe what this resource offers..."
          />
        </UFormGroup>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="Website">
            <UInput v-model="form.link" type="url" placeholder="https://..." />
          </UFormGroup>
          <UFormGroup label="Contact email">
            <UInput v-model="form.email" type="email" placeholder="contact@example.com" />
          </UFormGroup>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="Communities served">
            <USelectMenu
              v-model="form.communities"
              :options="communityOptions"
              multiple
              placeholder="Select communities"
            />
          </UFormGroup>
          <UFormGroup label="Industries">
            <USelectMenu
              v-model="form.industries"
              :options="INDUSTRIES"
              multiple
              placeholder="Select industries"
            />
          </UFormGroup>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormGroup label="Counties">
            <USelectMenu
              v-model="form.locations"
              :options="UTAH_COUNTIES"
              multiple
              searchable
              placeholder="Select counties"
            />
          </UFormGroup>
          <UFormGroup label="Topics">
            <USelectMenu
              v-model="form.topics"
              :options="TOPICS"
              multiple
              placeholder="Select topics"
            />
          </UFormGroup>
        </div>
      </div>

      <template v-if="!success" #footer>
        <div class="flex items-center justify-end gap-3">
          <UButton variant="ghost" color="gray" @click="isOpen = false">Cancel</UButton>
          <UButton
            :loading="isSaving"
            :disabled="!form.title.trim()"
            style="background-color: var(--brand-green-dark); color: white;"
            @click="submit"
          >
            Submit Suggestion
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
