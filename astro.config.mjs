// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import compress from "astro-compress";
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
    csp: true,
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Monomakh",
        cssVariable: "--font-monomakh",
      },
    ],
  },
  integrations: [
    compress({
      CSS: true,
      HTML: false, // Svelte can't handle this HTML compression
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),
    svelte(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
