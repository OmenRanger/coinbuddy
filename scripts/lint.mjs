import { readdir, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { extname, join, resolve } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "README.md",
  "ROADMAP.md",
  "CHANGELOG.md",
  ".env.example",
  "docs/product-brief.md",
  "docs/ui-style-guide.md",
  "docs/storage-plan.md",
  "docs/testing-plan.md",
  "vault/CoinBuddy-Context.md",
  "src/app/main.js",
  "src/styles/styles.css"
];

const allFiles = await walk(root);
const codeFiles = allFiles.filter((file) => [".js", ".mjs"].includes(extname(file)));
const textFiles = allFiles.filter((file) => [".js", ".mjs", ".md", ".html", ".css", ".json"].includes(extname(file)));

for (const file of requiredFiles) {
  const absolute = resolve(root, file);
  if (!allFiles.includes(absolute)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

for (const file of codeFiles) {
  await checkSyntax(file);
}

for (const file of textFiles) {
  const text = await readFile(file, "utf8");
  if (text.includes(String.fromCharCode(226))) {
    throw new Error(`Possible mojibake found in ${file}`);
  }
}

console.log(`Lint passed for ${codeFiles.length} JavaScript files and ${requiredFiles.length} required files.`);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (["node_modules", "dist", ".git"].includes(entry.name)) {
      continue;
    }
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolute)));
    } else {
      files.push(absolute);
    }
  }
  return files;
}

function checkSyntax(file) {
  return new Promise((resolveCheck, rejectCheck) => {
    const child = spawn(process.execPath, ["--check", file], { stdio: "pipe" });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolveCheck();
      } else {
        rejectCheck(new Error(`Syntax check failed for ${file}\n${stderr}`));
      }
    });
  });
}
