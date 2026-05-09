<script setup lang="ts">
useSeoMeta({
  title: 'Startup State Initiative · Utah',
  description:
    'Welcome to the Startup Capital of the World. Discover the resources, programs, and companies building the future of Utah\'s economy.',
})

const cards = [
  {
    title: 'Starting a Business',
    cta: 'New Business Steps',
    to: '/navigator?category=starting',
    image: '/brand/thinking-image-1.webp',
    alt: 'Smiling man with beard in an apron',
  },
  {
    title: 'Grow Your Business',
    cta: 'Explore Resources',
    to: '/navigator',
    image: '/brand/starting-idea_1.webp',
    alt: 'Two people discussing and pointing at a laptop screen',
  },
  {
    title: 'Get Funding',
    cta: 'Funding Opportunities',
    to: '/navigator?category=funding',
    image: '/brand/growing-image-1.webp',
    alt: 'Woman in red shirt looking to the left and smiling',
  },
  {
    title: 'Build Connections',
    cta: 'Find Events',
    to: '#',
    image: '/brand/sell-exit-image-1.webp',
    alt: 'Two men talking and looking at a tablet',
  },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section
      class="relative overflow-hidden text-white"
      style="background-color: var(--brand-navy); background-image: url('/brand/hero-main-page-bg.webp'); background-repeat: no-repeat; background-position: top center; background-size: cover;"
    >
      <!-- Flat navy overlay matching startup.utah.gov -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="background-color: rgba(13, 25, 44, 0.4);"
      />
      <UContainer class="max-w-7xl relative">
        <div class="py-24 md:py-32 max-w-3xl">
          <span
            class="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full mb-6"
            style="background-color: var(--brand-green-bright); color: #052e16"
          >
            Startup State Initiative
          </span>
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
            Welcome to the
            <span style="color: var(--brand-green-bright)">Startup Capital</span>
            of the World
          </h1>
          <p class="mt-3 text-2xl font-semibold" style="color: var(--brand-green-light)">
            Start something here.
          </p>
          <p class="mt-6 text-lg leading-relaxed" style="color: #a8b2d1">
            The Startup State Initiative highlights what already exists in Utah and
            elevates it to new heights — connecting founders to the resources,
            funding, and community that make this the best place to build.
          </p>
          <div class="mt-10 flex flex-wrap items-center gap-4">
            <UButton
              to="/journey"
              size="xl"
              :ui="{
                color: {
                  primary: {
                    solid: 'shadow-lg font-bold',
                  },
                },
              }"
              class="font-bold"
              style="background-color: var(--brand-green-bright); color: #052e16"
            >
              Start your journey
            </UButton>
            <UButton
              to="#"
              size="xl"
              variant="outline"
              class="font-bold border-white text-white hover:bg-white hover:text-startup-navy-800"
            >
              About the Initiative
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- UTAH's thriving ecosystem -->
    <section
      class="thriving-section relative px-4 pt-24 pb-24"
      style="background-color: var(--brand-navy)"
    >
      <!-- Top angle separator (matches OG x-separator-top-angle-in: bottom-right triangle) -->
      <svg
        class="absolute top-0 left-0 w-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style="height: 60px; color: #08192e; fill: currentColor;"
      >
        <polygon points="0,100 100,100 100,0" />
      </svg>

      <div class="relative max-w-7xl mx-auto">
        <!-- Heading + subtitle -->
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="thriving-h2">UTAH's thriving ecosystem</h2>
          <p class="thriving-sub">
            Be a part of Utah's thriving startup scene. Start, grow, and build your
            business in the Startup Capital of the World.
          </p>
        </div>

        <!-- 4 cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <article
            v-for="card in cards"
            :key="card.title"
            class="flex flex-col items-center text-center"
          >
            <img
              :src="card.image"
              :alt="card.alt"
              class="w-full aspect-square object-cover mb-7"
            />
            <h3 class="thriving-card-h3">{{ card.title }}</h3>
            <NuxtLink :to="card.to" class="thriving-card-btn">
              {{ card.cta }}
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <!-- Utah: The Startup State -->
    <section class="py-20 px-4" style="background-color: var(--brand-navy)">
      <UContainer class="max-w-7xl">
        <!-- Centered intro block (spans full row width to match image columns below) -->
        <div class="mb-16">
          <img
            src="/brand/startup-logo-small.svg"
            alt="Startup State logo"
            class="w-16 h-auto mx-auto mb-6"
            style="filter: drop-shadow(0px 8px 10px rgb(255 255 255 / 0.8));"
          />
          <h2
            style="
              color: #11df81;
              font-size: 1.6em;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              line-height: 1.4;
              text-align: center;
              padding: 2em 0 1em 0;
              margin: 0;
            "
          >
            UTAH: THE STARTUP STATE
          </h2>
          <p
            style="
              color: #ffffff;
              font-size: 18px;
              line-height: 1.5;
              text-align: left;
              margin: 0 0 1em 0;
            "
          >
            The
            <a
              href="https://startup.utah.gov/why-utah/"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold hover:opacity-80 transition-opacity"
              style="color: #11df81"
            >
              Governor's Office of Economic Opportunity Startup State Initiative
              <UIcon name="i-heroicons-arrow-top-right-on-square-20-solid" class="inline w-4 h-4 ml-0.5 -mt-0.5" />
            </a>
            celebrates, inspires, and empowers Utah entrepreneurs and those who support
            them. It consists of a statewide entrepreneurship brand and business resource
            portal being developed on this site. This collaborative initiative supports
            entrepreneurs throughout the lifecycle of their business and encourages them
            to start in Utah.
          </p>
        </div>

        <!-- Two-column row: Community + Team (orange vertical divider between them) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <article
            class="flex flex-col md:pr-12 md:border-r"
            style="border-right-color: var(--brand-amber)"
          >
            <img
              src="/brand/asset-1@3x.webp"
              alt="Salt Lake City at night"
              class="w-full h-auto rounded-xl shadow-lg mb-6"
            />
            <h3 class="text-2xl font-extrabold text-white mb-4">
              Utah's Startup Community
            </h3>
            <div class="space-y-4 leading-relaxed" style="color: #a8b2d1">
              <p>
                Utah provides fertile soil for modern innovators and entrepreneurs. As the
                country's fastest-growing state, with a well-educated workforce and thriving
                economy, Utah's mountains, valleys, deserts, and plateaus provide the
                perfect environment to nourish and champion the startup and entrepreneurial
                spirit.
              </p>
              <p>
                The state's growth, unparalleled quality of life, government support for
                small businesses, and access to startup networks and capital attract doers
                and innovative thinkers to Utah's communities.
              </p>
              <p>
                In January 2023, WalletHub named Utah the No. 1 best state to start a
                business. Utah is the startup state.
              </p>
            </div>
          </article>

          <article class="flex flex-col">
            <img
              src="/brand/goeo_pic.webp"
              alt="Governor's Office of Economic Opportunity team"
              class="w-full h-auto rounded-xl shadow-lg mb-6"
            />
            <h3 class="text-2xl font-extrabold text-white mb-4">
              Utah's Startup State Initiative Team
            </h3>
            <div class="space-y-4 leading-relaxed" style="color: #a8b2d1">
              <p>
                In 2023, under the leadership of Gov. Spencer Cox, Utah was designated as
                the Startup Capital of the World — a place filled with opportunities of
                advancement for Utah entrepreneurs. The Governor's Office of Economic
                Opportunity (GOEO) leads the Startup State Initiative, supporting policies
                and programs that strengthen Utah's entrepreneurial ecosystem.
              </p>
              <p>
                This website and its resources are part of GOEO's ongoing efforts to
                promote and amplify Utah's vibrant startup community and elevate statewide
                conversations, connections, and tools for success.
              </p>
            </div>
          </article>
        </div>
      </UContainer>
    </section>
  </div>
</template>
