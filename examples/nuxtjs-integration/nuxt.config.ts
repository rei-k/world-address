// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@sidebase/nuxt-auth'
  ],

  runtimeConfig: {
    // Private keys (server-side only)
    authSecret: process.env.AUTH_SECRET,
    webhookSecret: process.env.WEBHOOK_SECRET,
    
    // Public keys (exposed to client)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },

  auth: {
    baseURL: process.env.AUTH_ORIGIN || 'http://localhost:3000',
    provider: {
      type: 'local'
    }
  },

  typescript: {
    strict: true,
    typeCheck: true
  },

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  compatibilityDate: '2024-12-08'
})
