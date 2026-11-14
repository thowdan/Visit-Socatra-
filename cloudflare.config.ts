import { defineConfig } from "cf/config";

// Static-assets-only Worker: serves the Vite build, no server code.
export default defineConfig({
  worker: {
    name: "visit-socotra",
    compatibilityDate: "2026-11-14",
    domains: ["socotra.tb3technologies.tech"],
    assets: {
      htmlHandling: "auto-trailing-slash",
      notFoundHandling: "404-page",
    },
  },
});
