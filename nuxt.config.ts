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
  css: ["~/assets/css/main.css"],
  fonts: {
    families: [
      {
        name: "Montserrat",
        provider: "google",
        weights: ["100 900"],
      },
    ],
  },
  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
    plugins: [tailwindcss()],
  },

  modules: ["@nuxt/fonts", "@pinia/nuxt", "pinia-plugin-persistedstate"],
});
