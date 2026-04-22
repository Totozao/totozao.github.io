import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  components: [
    {
      path: "~/modules/shared",
      prefix: "Shared",
    },
    {
      path: "~/modules/index",
      prefix: "Index",
    },
  ],
  fonts: {
    families: [
      {
        name: "Montserrat",
        provider: "google",
        weights: ["100 900"],
      },
    ],
  },
  experimental: {
    serverAppConfig: false,
  },
  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
    plugins: [tailwindcss() as any],
  },

  modules: [
    "@nuxt/fonts",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate",
    "@nuxt/eslint",
    "@vite-pwa/nuxt",
  ],
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Ведущая мафия",
      short_name: "МАФО",
      description: "Мафия для ведущего",
      theme_color: "#4A90E2",
      icons: [
        {
          src: "/pwa-icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/pwa-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      runtimeCaching: [
        {
          urlPattern: "https://example.com/.*",
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 86400,
            },
          },
        },
      ],
    },
  },
});
