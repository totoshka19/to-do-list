export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Переопределяется переменной окружения NUXT_PUBLIC_API_BASE на Vercel
      apiBase: 'http://localhost:3001',
    },
  },

  nitro: {
    preset: 'vercel',
  },
})
