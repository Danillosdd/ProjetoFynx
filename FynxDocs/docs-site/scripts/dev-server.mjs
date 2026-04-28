import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createReadStream, existsSync, watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, "../..");
const port = Number(process.env.PORT || 4177);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

const clients = new Set();

function broadcastReload() {
  for (const client of clients) {
    client.write("data: reload\n\n");
  }
}

let timeout = null;
watch(docsRoot, { recursive: true }, (eventType, filename) => {
  if (filename && /\.(md|css|js|html)$/.test(filename)) {
    // Debounce to prevent multiple reloads on a single save
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      console.log(`[Reload] Arquivo alterado: ${filename}`);
      broadcastReload();
    }, 150);
  }
});

function resolveRequest(url) {
  const parsed = new URL(url, `http://localhost:${port}`);
  let pathname = decodeURIComponent(parsed.pathname);

  if (pathname === "/") {
    pathname = "/docs-site/";
  }

  if (pathname.endsWith("/")) {
    pathname += "index.html";
  }

  const filePath = path.resolve(docsRoot, `.${pathname}`);
  if (!filePath.startsWith(docsRoot)) {
    return null;
  }
  return filePath;
}

const server = createServer(async (request, response) => {
  if (request.url === "/docs-site/__live_reload__") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });
    clients.add(response);
    request.on("close", () => clients.delete(response));
    return;
  }

  const filePath = resolveRequest(request.url || "/");

  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  if (!existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  response.setHeader("Content-Type", contentTypes[extension] || "application/octet-stream");

  if (request.method === "HEAD") {
    response.writeHead(200);
    response.end();
    return;
  }

  try {
    if (extension === ".html") {
      response.end(await readFile(filePath, "utf8"));
      return;
    }
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500);
    response.end(error instanceof Error ? error.message : "Internal error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`FYNX Docs Site running at http://localhost:${port}/docs-site/`);
  console.log(`Serving ${docsRoot}`);
});
