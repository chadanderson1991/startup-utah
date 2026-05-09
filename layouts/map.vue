<script setup lang="ts">
const user = useSupabaseUser()
const route = useRoute()
const supabase = useSupabaseClient()

const isAdmin = computed(
  () =>
    user.value?.user_metadata?.role === 'admin' ||
    user.value?.app_metadata?.role === 'admin',
)

const navLinks = [
  { label: 'Start Your Journey', to: '/journey' },
  { label: 'Resources', to: '/navigator' },
  {
    label: 'Get Funding',
    children: [
      { label: 'Grants', to: '/journey/9' },
      { label: 'Other Funding Sources', to: '/journey/13' },
    ],
  },
  { label: 'Startup Map', to: '/map' },
  { label: 'Why Utah?', to: '#' },
  { label: 'Events', to: 'https://business.utah.gov/events/list/?tribe_eventcategory%5B0%5D=2732', external: true, target: '_blank' },
  { label: 'News', to: '#' },
  { label: 'Contact', to: '/contact' },
]

async function signOut() {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div style="position: fixed; inset: 0; overflow: hidden;">
    <!-- Map fills the entire screen -->
    <main style="position: absolute; inset: 0; z-index: 0;">
      <slot />
    </main>

    <!-- Header floats over the map -->
    <header style="position: absolute; top: 0; left: 0; right: 0; z-index: 30;">
      <!-- Brand row: white -->
      <div class="bg-white border-b border-gray-100">
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
              <UButton
                to="/profile"
                size="sm"
                variant="ghost"
                color="gray"
                icon="i-heroicons-user-circle-20-solid"
              >
                {{ user.email?.split('@')[0] }}
              </UButton>
              <UButton
                size="sm"
                variant="ghost"
                color="gray"
                icon="i-heroicons-arrow-right-on-rectangle-20-solid"
                @click="signOut"
              >
                Sign out
              </UButton>
            </template>
          </div>
        </div>
      </div>

      <!-- Nav row: dark navy -->
      <div style="background-color: var(--brand-navy)">
        <UContainer class="max-w-7xl">
          <nav class="hidden lg:flex items-center gap-1 h-12">
            <template v-for="link in navLinks" :key="link.label">
              <UDropdown
                v-if="link.children"
                :items="[link.children]"
                :popper="{ placement: 'bottom-start' }"
              >
                <button
                  class="flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors"
                  :class="
                    link.children.some(c => c.to === route.path)
                      ? 'text-white bg-white/15'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  "
                >
                  {{ link.label }}
                  <UIcon name="i-heroicons-chevron-down-20-solid" class="w-4 h-4" />
                </button>
              </UDropdown>
              <NuxtLink
                v-else
                :to="link.to"
                :external="link.external"
                :target="link.target"
                :rel="link.target === '_blank' ? 'noreferrer noopener' : undefined"
                class="px-3 py-2 text-sm font-semibold rounded-md transition-colors"
                :class="
                  route.path === link.to
                    ? 'text-white bg-white/15'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                "
              >
                {{ link.label }}
              </NuxtLink>
            </template>
          </nav>
        </UContainer>
      </div>
    </header>
  </div>
</template>
