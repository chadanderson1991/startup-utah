<script setup lang="ts">
const user = useSupabaseUser()
const route = useRoute()

const isAdmin = computed(
  () =>
    user.value?.user_metadata?.role === 'admin' ||
    user.value?.app_metadata?.role === 'admin',
)

const navLinks = [
  { label: 'Start Your Journey', to: '/journey' },
  { label: 'Resources', to: '/navigator' },
  { label: 'Get Funding', to: '/navigator?category=funding' },
  { label: 'Startup Map', to: '/map' },
  { label: 'Why Utah?', to: '#' },
  { label: 'Events', to: '#' },
  { label: 'News', to: '#' },
  { label: 'Contact', to: '#' },
]
</script>

<template>
  <div class="flex flex-col" style="height: 100vh; overflow: hidden;">
    <header class="bg-white border-b border-gray-200 z-30 shrink-0">
      <!-- Brand row: UTAH | Startup State | GOEO  (full-width, edge-aligned) -->
      <div class="border-b border-gray-100">
        <div class="flex items-stretch justify-between gap-4 w-full pl-4 pr-4 sm:pl-6 sm:pr-6">
          <UtahHeaderBrand />
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
      </div>

      <!-- Nav row -->
      <UContainer class="max-w-7xl">
        <nav class="hidden lg:flex items-center gap-1 h-12">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.label"
            :to="link.to"
            class="px-3 py-2 text-sm font-semibold rounded-md transition-colors"
            :class="
              route.path === link.to
                ? 'text-startup-green-700 bg-startup-green-50'
                : 'text-gray-700 hover:text-startup-green-700 hover:bg-startup-green-50'
            "
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </UContainer>
    </header>

    <main class="flex-1 relative overflow-hidden">
      <slot />
    </main>
  </div>
</template>
