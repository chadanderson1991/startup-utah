<script setup lang="ts">
const user = useSupabaseUser()
const route = useRoute()

const isAdmin = computed(
  () =>
    user.value?.user_metadata?.role === 'admin' ||
    user.value?.app_metadata?.role === 'admin',
)

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Find Resources', to: '/navigator' },
  { label: 'Startup Map', to: '/map' },
]
</script>

<template>
  <div class="flex flex-col" style="height: 100vh; overflow: hidden;">
    <header class="bg-white border-b border-gray-200 z-30 shrink-0">
      <UContainer class="max-w-7xl">
        <div class="flex items-center justify-between h-16 gap-4">
          <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
            <div
              class="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm"
              style="background-color: #1a365d"
            >
              SU
            </div>
            <span class="font-bold text-gray-900 hidden sm:block">
              Startup State
              <span class="text-gray-400 font-normal">· Utah</span>
            </span>
          </NuxtLink>

          <nav class="flex items-center gap-1">
            <UButton
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              variant="ghost"
              color="gray"
              size="sm"
              :class="route.path === link.to ? 'text-blue-700 bg-blue-50' : ''"
            >
              {{ link.label }}
            </UButton>
          </nav>

          <div class="flex items-center gap-2 shrink-0">
            <UButton
              v-if="isAdmin"
              to="/admin"
              size="sm"
              variant="outline"
              color="gray"
              icon="i-heroicons-cog-6-tooth-20-solid"
            >
              Admin
            </UButton>
            <template v-if="!user">
              <UButton to="/login" size="sm" variant="ghost" color="gray">Sign in</UButton>
            </template>
            <template v-else>
              <UButton size="sm" variant="ghost" color="gray" icon="i-heroicons-user-circle-20-solid">
                {{ user.email?.split('@')[0] }}
              </UButton>
            </template>
          </div>
        </div>
      </UContainer>
    </header>

    <!-- Map fills all remaining height -->
    <main class="flex-1 relative overflow-hidden">
      <slot />
    </main>
  </div>
</template>
