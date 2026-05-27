// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const port = parseInt(process.env.PORT || "4321");

export default defineConfig({
  site: "https://lastthread.co",
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Allow Replit's preview proxy hostnames (e.g. *.janeway.replit.dev).
      // Leading dot is Vite's wildcard for subdomains. Without this, the
      // dev server rejects requests with "Blocked request. This host ... is
      // not allowed."
      allowedHosts: [".replit.dev", "localhost", "127.0.0.1"],
    },
  },
  server: {
    port,
    host: true,
  },
});
