import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: process.env.GITHUB_PAGES ? "/fatina-d-oro/" : "/",
  server: {
    port: 5173,
    host: true,
    open: mode === "fairy" ? "/?scene=fairy" : false,
  },
}));
