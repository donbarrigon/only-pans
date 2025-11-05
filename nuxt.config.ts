// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    dbString: process.env.DB_STRING || 'mongodb://localhost:27017',
    dbName: process.env.DB_NAME || 'sample_mflix',
    sessionLife: process.env.SESSION_LIFE ? Number(process.env.SESSION_LIFE) : 1000 * 60 * 60 * 24,
  },

  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/scripts', '@nuxt/test-utils', '@nuxt/ui'],
})
