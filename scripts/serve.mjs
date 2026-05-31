import { createReadStream, existsSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import http from "node:http";
import { extname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

export async function startStaticServer(root = process.cwd(), preferredPort = 4173) {
  const absoluteRoot = resolve(root);
  const port = await findOpenPort(preferredPort);
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(requestUrl.pathname);
    let filePath = resolve(join(absoluteRoot, pathname));

    if (!filePath.startsWith(absoluteRoot)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = join(absoluteRoot, "index.html");
    }

    const type = mimeTypes[extname(filePath)] || "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-store"
    });
    createReadStream(filePath).pipe(response);
  });

  await new Promise((resolveListen) => server.listen(port, "127.0.0.1", resolveListen));
  return {
    server,
    port,
    url: `http://127.0.0.1:${port}/`
  };
}

async function findOpenPort(startPort) {
  let port = startPort;
  while (port < startPort + 50) {
    const isOpen = await canUsePort(port);
    if (isOpen) {
      return port;
    }
    port += 1;
  }
  throw new Error(`No open port found from ${startPort} to ${startPort + 49}.`);
}

function canUsePort(port) {
  return new Promise((resolvePort) => {
    const probe = http.createServer();
    probe.once("error", () => resolvePort(false));
    probe.once("listening", () => probe.close(() => resolvePort(true)));
    probe.listen(port, "127.0.0.1");
  });
}

async function main() {
  const rootArg = process.argv[2] || ".";
  const root = resolve(process.cwd(), rootArg);
  const { url } = await startStaticServer(root, Number(process.env.PORT || 4173));
  const files = await readdir(root);
  console.log(`CoinBuddy preview running at ${url}`);
  console.log(`Serving ${root}`);
  console.log(`Top-level files: ${files.slice(0, 8).join(", ")}`);
}

if (import.meta.url === pathToFileURL(fileURLToPath(import.meta.url)).href && process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
