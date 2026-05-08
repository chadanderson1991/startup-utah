<script setup lang="ts">
useSeoMeta({
  title: 'Startup State · Utah',
  description:
    'Discover the resources, programs, and companies building the future of Utah\'s economy.',
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section
      class="flex flex-col items-center justify-center text-center px-4 py-24"
      style="background-color: #1a365d"
    >
      <UBadge color="blue" variant="subtle" class="mb-4 text-blue-200 border border-blue-400 bg-blue-900">
        startup.utah.gov
      </UBadge>
      <h1 class="text-5xl sm:text-6xl font-extrabold text-white leading-tight max-w-3xl">
        Utah's Startup State
      </h1>
      <p class="mt-4 text-lg text-blue-200 max-w-xl">
        Discover the resources, programs, and companies building the future of
        Utah's economy.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <UButton to="/navigator" size="xl" color="white" variant="solid">
          Find Resources
        </UButton>
        <UButton
          to="/map"
          size="xl"
          color="white"
          variant="outline"
          class="border-white text-white hover:bg-white hover:text-blue-900"
        >
          Explore the Map
        </UButton>
      </div>
    </section>

    <!-- Stats bar -->
    <section class="bg-white border-b border-gray-100">
      <UContainer class="max-w-7xl">
        <div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 py-6">
          <div class="flex flex-col items-center px-4 py-2">
            <span class="text-3xl font-extrabold text-gray-900">213</span>
            <span class="text-sm text-gray-500 mt-0.5">Resources</span>
          </div>
          <div class="flex flex-col items-center px-4 py-2">
            <span class="text-3xl font-extrabold text-gray-900">223+</span>
            <span class="text-sm text-gray-500 mt-0.5">Companies</span>
          </div>
          <div class="flex flex-col items-center px-4 py-2">
            <span class="text-3xl font-extrabold text-gray-900">29</span>
            <span class="text-sm text-gray-500 mt-0.5">Counties</span>
          </div>
          <div class="flex flex-col items-center px-4 py-2">
            <span class="text-3xl font-extrabold text-gray-900">7</span>
            <span class="text-sm text-gray-500 mt-0.5">Sectors</span>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Feature cards -->
    <section class="py-16 px-4">
      <UContainer class="max-w-7xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Founder's Navigator -->
          <UCard class="flex flex-col">
            <template #header>
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  style="background-color: #1a365d"
                >
                  <UIcon name="i-heroicons-map" class="w-5 h-5 text-white" />
                </div>
                <h2 class="text-xl font-bold text-gray-900">Founder's Navigator</h2>
              </div>
            </template>
            <p class="text-gray-600 flex-1">
              Browse and filter 200+ state resources tailored to your industry,
              location, and business stage. Get AI-powered guidance from our
              chatbot trained on Utah's startup ecosystem.
            </p>
            <template #footer>
              <UButton to="/navigator" color="primary" block>
                Find Resources
              </UButton>
            </template>
          </UCard>

          <!-- Startup Map -->
          <UCard class="flex flex-col">
            <template #header>
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  style="background-color: #cc0000"
                >
                  <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-white" />
                </div>
                <h2 class="text-xl font-bold text-gray-900">Startup Map</h2>
              </div>
            </template>
            <p class="text-gray-600 flex-1">
              Explore Utah's startup landscape on an interactive map. Discover
              companies by sector, stage, and hiring status across all 29
              counties.
            </p>
            <template #footer>
              <UButton to="/map" color="primary" variant="outline" block>
                Explore the Map
              </UButton>
            </template>
          </UCard>
        </div>
      </UContainer>
    </section>
  </div>
</template>
