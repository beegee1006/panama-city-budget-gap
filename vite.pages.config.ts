import { resolve } from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = resolve(import.meta.dirname, ".");

/** Static site for GitHub Pages. Relative asset paths work on a project URL and on a custom domain. */
export default defineConfig({
  root: resolve(root, "pages"),
  base: "./",
  publicDir: false,
  plugins: [tailwindcss(), viteReact()],
  resolve: {
    alias: { "@": resolve(root, "src") },
  },
  build: {
    outDir: resolve(root, "docs"),
    emptyOutDir: true,
  },
});
