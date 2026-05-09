<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const isSubmitting = ref(false)
const submitted = ref(false)
const errorMessage = ref<string | null>(null)

async function handleSubmit() {
  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return
  isSubmitting.value = true
  errorMessage.value = null
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: form,
    })
    submitted.value = true
  } catch {
    errorMessage.value = 'Something went wrong. Please email us directly at startups@utah.gov.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="submitted" class="flex flex-col items-center gap-3 py-8 text-center">
    <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-green-500" />
    <p class="font-semibold text-gray-900">Message sent!</p>
    <p class="text-sm text-gray-500">We'll get back to you as soon as we can.</p>
  </div>

  <form v-else class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <UAlert v-if="errorMessage" icon="i-heroicons-exclamation-triangle" color="red" :description="errorMessage" />

    <UFormGroup label="Name" required>
      <UInput v-model="form.name" placeholder="Your name" />
    </UFormGroup>

    <UFormGroup label="Email" required>
      <UInput v-model="form.email" type="email" placeholder="you@example.com" />
    </UFormGroup>

    <UFormGroup label="Subject">
      <UInput v-model="form.subject" placeholder="What's this about?" />
    </UFormGroup>

    <UFormGroup label="Message" required>
      <UTextarea v-model="form.message" placeholder="How can we help?" :rows="5" />
    </UFormGroup>

    <UButton type="submit" color="primary" block :loading="isSubmitting">
      Send Message
    </UButton>
  </form>
</template>
