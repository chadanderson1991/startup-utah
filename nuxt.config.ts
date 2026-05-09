export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/supabase', '@netlify/nuxt'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      ],
    },
  },
  ui: {
    global: true,
  },
  supabase: {
    redirect: false,
    serviceKey: undefined,
  },
  runtimeConfig: {
    anthropicApiKey: '',
    groqApiKey: '',
    supabaseServiceKey: '',
    public: {
      mapboxToken: '',
      brandfetchClientId: '',
    },
  },
  css: ['mapbox-gl/dist/mapbox-gl.css', '~/assets/css/main.css'],
  colorMode: {
    preference: 'light',
  },
  typescript: {
    strict: true,
  },
})
