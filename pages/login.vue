<script setup lang="ts">
import { ref, computed } from 'vue'

useSeoMeta({ title: 'Sign In · Startup State Utah' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

type Mode = 'signin' | 'signup'
const mode = ref<Mode>('signin')
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const infoMessage = ref<string | null>(null)

const submitLabel = computed(() => (mode.value === 'signin' ? 'Sign in' : 'Create account'))

watch(user, (u) => {
  if (u) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    navigateTo(redirect)
  }
}, { immediate: true })

function switchMode(next: Mode) {
  mode.value = next
  errorMessage.value = null
  infoMessage.value = null
}

async function handleSubmit() {
  const emailTrimmed = email.value.trim()
  if (!emailTrimmed || !password.value) return
  isSubmitting.value = true
  errorMessage.value = null
  infoMessage.value = null
  try {
    if (mode.value === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password: password.value,
      })
      if (error) throw error
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: emailTrimmed,
        password: password.value,
      })
      if (error) throw error
      // If "Confirm email" is OFF in Supabase, session is created and the user watcher will redirect.
      // If it is ON, no session is returned; show a notice.
      if (!data.session) {
        infoMessage.value = 'Account created. Please check your email to confirm before signing in.'
      }
    }
  } catch (err: unknown) {
    const e = err as { message?: string }
    errorMessage.value = e.message ?? 'Something went wrong. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="text-center">
          <img
            src="/brand/startup-logo-small.svg"
            alt="Startup State"
            class="w-10 h-10 mx-auto mb-3 p-2 rounded-lg"
            style="background-color: var(--brand-green)"
          />
          <h1 class="text-xl font-bold text-gray-900">
            {{ mode === 'signin' ? 'Sign in to Startup State' : 'Create your account' }}
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ mode === 'signin'
              ? 'Sign in to save your profile and track your businesses.'
              : 'Create an account to save your profile and track your businesses.' }}
          </p>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <UAlert
          v-if="errorMessage"
          icon="i-heroicons-exclamation-triangle"
          color="red"
          :description="errorMessage"
        />
        <UAlert
          v-if="infoMessage"
          icon="i-heroicons-envelope-20-solid"
          color="primary"
          :description="infoMessage"
        />

        <UFormGroup label="Email address">
          <UInput
            v-model="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            @keydown.enter="handleSubmit"
          />
        </UFormGroup>

        <UFormGroup label="Password">
          <UInput
            v-model="password"
            type="password"
            :placeholder="mode === 'signup' ? 'At least 6 characters' : 'Your password'"
            :autocomplete="mode === 'signin' ? 'current-password' : 'new-password'"
            @keydown.enter="handleSubmit"
          />
        </UFormGroup>

        <UButton
          color="primary"
          block
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          {{ submitLabel }}
        </UButton>
      </div>

      <template #footer>
        <p class="text-xs text-center text-gray-500">
          <template v-if="mode === 'signin'">
            Don't have an account?
            <button class="text-primary-600 hover:underline font-medium" @click="switchMode('signup')">
              Create one
            </button>
          </template>
          <template v-else>
            Already have an account?
            <button class="text-primary-600 hover:underline font-medium" @click="switchMode('signin')">
              Sign in
            </button>
          </template>
        </p>
      </template>
    </UCard>
  </div>
</template>
