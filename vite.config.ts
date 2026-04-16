import { defineConfig } from "vite";

const resolveBase = (): string => {
  // In GitHub Actions for Pages, derive /<repo>/ from GITHUB_REPOSITORY.
  if (process.env.GITHUB_ACTIONS === "true") {
    const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
    return repo ? `/${repo}/` : "/fatina-d-oro/";
  }

  // Keep support for explicit local override.
  if (process.env.GITHUB_PAGES) {
    return "/fatina-d-oro/";
  }

  return "/";
};

export default defineConfig(({ mode }) => ({
  base: resolveBase(),
  server: {
    port: 5173,
    host: true,
    open: mode === "fairy" ? "/?scene=fairy" : false,
  },
}));
