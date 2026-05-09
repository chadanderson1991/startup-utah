<script setup lang="ts">
const user = useSupabaseUser()
const route = useRoute()
const supabase = useSupabaseClient()

const isAdmin = computed(
  () =>
    user.value?.user_metadata?.role === 'admin' ||
    user.value?.app_metadata?.role === 'admin',
)

async function signOut() {
  await supabase.auth.signOut()
  navigateTo('/login')
}

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
  { label: 'Events', to: 'https://business.utah.gov/events/list/?tribe_eventcategory%5B0%5D=2732', external: true, target: '_blank' },
  { label: 'Contact', to: '/contact' },
]

const socials = [
  {
    title: 'Facebook',
    href: 'https://facebook.com/businessutah',
    external: true,
    path: 'M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z',
  },
  {
    title: 'Instagram',
    href: 'https://instagram.com/businessutah',
    external: true,
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  {
    title: 'Twitter',
    href: 'https://twitter.com/businessutah',
    external: true,
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    title: 'LinkedIn',
    href: 'https://www.linkedin.com/company/businessutah/',
    external: true,
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    title: 'YouTube',
    href: 'https://www.youtube.com/channel/UC8Ombh9mGzeKq_KzKyA1oeA',
    external: true,
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    title: 'Email',
    href: 'mailto:startup@utah.gov',
    external: false,
    // Heroicons envelope (24x24, currentColor)
    path: 'M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67zM22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z',
  },
  {
    title: 'Phone',
    href: 'tel:18015388680',
    external: false,
    // Heroicons phone
    path: 'M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z',
  },
]
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <header class="sticky top-0 z-30">
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
              <UButton to="/login" size="sm" variant="ghost" color="gray">
                Sign in
              </UButton>
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

    <main class="flex-1">
      <slot />
    </main>

    <!-- Newsletter CTA (above footer) -->
    <section class="px-4 py-20" style="background-color: var(--brand-navy)">
      <div class="max-w-3xl mx-auto text-center">
        <h2
          class="font-extrabold tracking-tight mb-6"
          style="color: var(--brand-amber); font-size: 2.5em; line-height: 1.1"
        >
          Subscribe to Our Newsletter
        </h2>
        <p class="text-base sm:text-lg leading-relaxed mb-8" style="color: #ffffff">
          Need some money to get your idea off the ground? Looking for a collaborative
          community of like-minded entrepreneurs? Consider subscribing to the Startup
          State Initiative newsletter so you can receive monthly updates on resources,
          tips, events, and more.
        </p>
        <a
          href="https://cdn.forms-content.sg-form.com/06b418c5-1057-11ee-9a80-ca5180dad175"
          target="_blank"
          rel="noreferrer noopener"
          class="inline-block font-bold rounded-md transition-colors hover:bg-transparent hover:text-white"
          style="
            background-color: var(--brand-green-bright);
            border: 1px solid var(--brand-green-bright);
            color: #0D192D;
            padding: 1em 1.6em;
            font-size: 1.15rem;
            letter-spacing: 0.04em;
          "
        >
          Learn More
        </a>
      </div>
    </section>

    <footer class="text-white">
      <!-- Social bar -->
      <div style="background-color: #233044">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center gap-2">
          <span class="text-base font-normal mr-3">Let's connect</span>
          <a
            v-for="s in socials"
            :key="s.title"
            :href="s.href"
            :target="s.external ? '_blank' : undefined"
            :rel="s.external ? 'noreferrer noopener' : undefined"
            :title="s.title"
            class="rounded-full p-2 text-white hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            <svg
              class="fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style="width: 1.8em; height: 1.8em;"
            >
              <path :d="s.path" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Main footer -->
      <div style="background-color: #141313">
        <div class="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10" style="padding-top: 32px; padding-bottom: 32px;">
          <!-- Col 1: Logos -->
          <div class="flex flex-col items-start">
            <NuxtLink to="/" aria-label="Startup State home" class="mb-8">
              <img
                src="/brand/footer-logo.svg"
                alt="Startup State Utah"
                class="h-7 w-auto"
              />
            </NuxtLink>
            <a
              href="https://business.utah.gov/"
              target="_blank"
              rel="noreferrer noopener"
              class="inline-block"
            >
              <img
                src="/brand/goeo_white_standard.webp"
                alt="Governor's Office of Economic Opportunity"
                class="w-auto"
                style="height: 50px;"
              />
            </a>
          </div>

          <!-- Col 2: Address + email -->
          <div>
            <p style="font-size: 0.875rem; line-height: 1.4; max-width: 200px;">
              Utah Governor's Office of Economic Opportunity (GOEO)<br />
              60 East South Temple, Suite 300<br />
              Salt Lake City, Utah 84111-1041
            </p>
            <a
              href="mailto:startup@utah.gov"
              class="hover:opacity-80 transition-opacity inline-block mt-4"
              style="font-size: 0.875rem; color: var(--brand-green-bright)"
            >
              startup@utah.gov
            </a>
          </div>

          <!-- Col 3: Newsletter -->
          <div style="max-width: 240px;">
            <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5em; line-height: 1.4;">Email Newsletters</h3>
            <p style="font-size: 0.8em; font-weight: 700; line-height: 1.4; margin-bottom: 1em;">
              Sign up for our email newsletters to learn more about our office.
            </p>
            <a
              href="https://cdn.forms-content.sg-form.com/06b418c5-1057-11ee-9a80-ca5180dad175"
              target="_blank"
              rel="noreferrer noopener"
              class="newsletter-btn inline-flex items-center justify-center transition-colors"
            >
              Subscribe to Newsletter
            </a>
          </div>
        </div>
      </div>

      <!-- State-of-Utah bottom bar -->
      <div style="background-color: #141313">
        <div
          class="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 flex-wrap"
          style="border-top: 1px solid #f1f1f1;"
        >
          <!-- LEFT: UTAH brand + "An official state" -->
          <a
            href="https://utah.gov/"
            target="_blank"
            rel="noreferrer noopener"
            class="flex items-center"
            aria-label="An official state of Utah website"
          >
            <svg
              class="utah-footer__utah-brand"
              viewBox="0 0 105.9496 30"
              aria-hidden="true"
              style="width: 107px; min-width: 107px; fill: white;"
            >
              <g>
                <g>
                  <path d="M12.2714,30.0877c-4.1489,0-7.2318-1.2037-9.2489-3.611C1.0055,24.0693-.002,20.334,0,15.2709V0H7.8175V16.1806c0,2.6363,.356,4.4923,1.0679,5.5679,.7613,1.1018,2.0506,1.7162,3.3859,1.6134,1.3465,.0953,2.6458-.5157,3.4313-1.6134,.7422-1.0756,1.1133-2.9316,1.1133-5.5679V0h7.5448V15.2709c0,5.0601-.9847,8.7946-2.9541,11.2035-1.9694,2.4089-5.0145,3.6133-9.1352,3.6133Zm24.0887-.5463V6.5444h-7.8175V0h23.4526V6.5444h-7.8175V29.5414h-7.8175Zm25.8151-14.362l-.5002,2.0452h5.455l-.5002-2.0452c-.3637-1.4239-.7273-2.9693-1.091-4.636-.3637-1.6667-.7261-3.242-1.0871-4.7259h-.1821c-.3334,1.5151-.6743,3.0983-1.0226,4.7497s-.7053,3.189-1.071,4.6129l-.0008-.0008Zm-11.3617,14.362L59.8127,0h9.4502l9.0023,29.5414h-8.2724l-1.4544-6.2709h-8.2716l-1.4544,6.2709h-7.9988Zm30.2713,0V0h7.8175V10.9991h8.8171V0h7.8175V29.5414h-7.8175v-11.7251h-8.8194v11.7251h-7.8152Z"/>
                </g>
              </g>
            </svg>
            <span
              class="hidden sm:inline-block"
              style="height: 30px; width: 1px; background-color: #d7d7d7; margin: 0 1rem;"
            />
            <span style="font-size: 1.125rem;">An official state of Utah website</span>
          </a>

          <!-- RIGHT: Utah.gov + links inline, separated by white vertical lines -->
          <div
            class="flex flex-row flex-wrap items-center justify-center md:justify-end"
            style="gap: 1rem; font-size: 0.875rem;"
          >
            <span style="font-size: 1.125rem; font-weight: 600;">Utah.gov</span>
            <span class="inline-block" style="width: 1px; height: 16px; background-color: #ffffff;" />
            <a href="http://www.utah.gov" target="_blank" rel="noreferrer noopener" class="hover:underline">Home</a>
            <span class="inline-block" style="width: 1px; height: 16px; background-color: #ffffff;" />
            <a href="https://startup.utah.gov/brand/" target="_blank" rel="noreferrer noopener" class="hover:underline">Media and Press</a>
            <span class="inline-block" style="width: 1px; height: 16px; background-color: #ffffff;" />
            <a href="http://www.utah.gov/disclaimer.html" target="_blank" rel="noreferrer noopener" class="hover:underline">Terms&nbsp;of&nbsp;Use</a>
            <span class="inline-block" style="width: 1px; height: 16px; background-color: #ffffff;" />
            <a href="http://www.utah.gov/privacypolicy.html" target="_blank" rel="noreferrer noopener" class="hover:underline">Privacy&nbsp;Policy</a>
            <span class="inline-block" style="width: 1px; height: 16px; background-color: #ffffff;" />
            <a href="http://www.utah.gov/accessibility.html" target="_blank" rel="noreferrer noopener" class="hover:underline">Accessibility&nbsp;Policy</a>
            <span class="inline-block" style="width: 1px; height: 16px; background-color: #ffffff;" />
            <a href="http://www.utah.gov/translate.html" target="_blank" rel="noreferrer noopener" class="hover:underline">Translate</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
