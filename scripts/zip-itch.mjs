import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const distDir = join(root, "dist");
const indexHtml = join(distDir, "index.html");
const zipPath = join(root, "fatina-d-oro-itch.zip");

if (!existsSync(indexHtml)) {
  console.error("[build:itch] dist/index.html not found. Run the Vite build first.");
  process.exit(1);
}

const zip = spawnSync("zip", ["-r", zipPath, "."], {
  cwd: distDir,
  stdio: "inherit",
});

if (zip.error) {
  console.error("[build:itch] zip failed:", zip.error.message);
  console.error("Install the zip utility (e.g. apt install zip).");
  process.exit(1);
}

if (zip.status !== 0) {
  process.exit(zip.status ?? 1);
}

const { size } = statSync(zipPath);
const kb = (size / 1024).toFixed(1);
console.log(`[build:itch] Created ${zipPath} (${kb} KB)`);
