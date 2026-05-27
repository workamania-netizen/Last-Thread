// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const port = parseInt(process.env.PORT || "4321");

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    port,
    host: true,
  },
});
