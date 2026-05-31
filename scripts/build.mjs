import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const item of ["index.html", "manifest.webmanifest", "service-worker.js", "src"]) {
  await cp(resolve(root, item), resolve(dist, item), { recursive: true });
}

console.log(`Built CoinBuddy static site at ${dist}`);
