// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";

import svelte from "@astrojs/svelte";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      PUBLIC_USE_INSPECTOR: envField.boolean({
        access: "public",
        context: "client",
        default: false,
      }),
    },
  },

  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Monomakh",
        cssVariable: "--font-monomakh",
      },
    ],
  },

  integrations: [svelte()],

  vite: {
    plugins: [tailwindcss()],
  },
});
