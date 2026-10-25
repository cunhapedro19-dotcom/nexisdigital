import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const route = path.join(root, "src", "app", "api", "health", "route.ts");
const disabledRoute = `${route}.pages-disabled`;
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

if (!fs.existsSync(route)) {
  console.error(`Rota não encontrada: ${route}`);
  process.exit(1);
}

if (fs.existsSync(disabledRoute)) {
  console.error(`Arquivo temporário já existe: ${disabledRoute}`);
  process.exit(1);
}

let exitCode = 1;

try {
  fs.renameSync(route, disabledRoute);

  const result = spawnSync(process.execPath, [nextBin, "build"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, GITHUB_PAGES: "true" },
  });

  if (result.error) throw result.error;
  exitCode = result.status ?? 1;
} catch (error) {
  console.error("Erro no build:", error);
} finally {
  if (fs.existsSync(disabledRoute)) {
    fs.renameSync(disabledRoute, route);
  }
}

process.exitCode = exitCode;
