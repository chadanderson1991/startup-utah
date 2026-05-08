<script setup lang="ts">
import { ref } from 'vue'

useSeoMeta({ title: 'Sign In · Startup State Utah' })

const supabase = useSupabaseClient()
const email = ref('')
const isSending = ref(false)
const sent = ref(false)
const errorMessage = ref<string | null>(null)

async function handleMagicLink() {
  if (!email.value.trim()) return
  isSending.value = true
  errorMessage.value = null
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    if (error) throw error
    sent.value = true
  } catch (err: unknown) {
    const e = err as { message?: string }
    errorMessage.value = e.message ?? 'Failed to send login link.'
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="text-center">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-3"
            style="background-color: #1a365d"
          >
            SU
          </div>
          <h1 class="text-xl font-bold text-gray-900">Sign in to Startup State</h1>
          <p class="text-sm text-gray-500 mt-1">We'll send you a magic link — no password needed.</p>
        </div>
      </template>

      <div v-if="sent" class="flex flex-col items-center gap-3 py-4 text-center">
        <UIcon name="i-heroicons-envelope-20-solid" class="w-10 h-10 text-blue-600" />
        <p class="text-gray-700 font-medium">Check your email</p>
        <p class="text-sm text-gray-500">
          We sent a login link to <strong>{{ email }}</strong>. It expires in 10 minutes.
        </p>
      </div>

      <div v-else class="flex flex-col gap-4">
        <UAlert
          v-if="errorMessage"
          icon="i-heroicons-exclamation-triangle"
          color="red"
          :description="errorMessage"
        />
        <UFormGroup label="Email address">
          <UInput
            v-model="email"
            type="email"
            placeholder="you@example.com"
            @keydown.enter="handleMagicLink"
          />
        </UFormGroup>
        <UButton
          color="primary"
          block
          :loading="isSending"
          @click="handleMagicLink"
        >
          Send Magic Link
        </UButton>
      </div>

      <template #footer>
        <p class="text-xs text-center text-gray-400">
          Admin access only. Public visitors can use the site without signing in.
        </p>
      </template>
    </UCard>
  </div>
</template>
