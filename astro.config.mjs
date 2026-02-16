import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
export default defineConfig({
  site: "https://windowmaintenance.co.nz",
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) =>
        !page.endsWith("/thanks/") &&
        !page.endsWith("/blog/christmas-closure-2025/"),
    }),
  ],
});
