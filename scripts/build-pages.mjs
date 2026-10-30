import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

// Build de produção com export estático para o GitHub Pages.
// A configuração condicional (basePath, output) está em next.config.ts,
// ativada pela variável GITHUB_PAGES=true.
const result = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, GITHUB_PAGES: "true" },
});

if (result.error) {
  console.error("Erro no build:", result.error);
  process.exit(1);
}

process.exitCode = result.status ?? 1;
