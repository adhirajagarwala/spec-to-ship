import http from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { generatePlan } from "./generate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const webDir = path.join(rootDir, "web");
const port = Number(process.env.PORT || 3200);
const host = process.env.HOST || "127.0.0.1";

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

function reply(response, statusCode, payload, contentType = "application/json; charset=utf-8") {
  response.writeHead(statusCode, { "Content-Type": contentType, "Cache-Control": "no-store" });
  response.end(contentType.startsWith("application/json") ? `${JSON.stringify(payload, null, 2)}\n` : payload);
}

async function handler(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/") {
    reply(response, 200, await fs.readFile(path.join(webDir, "index.html"), "utf8"), "text/html; charset=utf-8");
    return;
  }
  if (request.method === "GET" && url.pathname === "/app.js") {
    reply(response, 200, await fs.readFile(path.join(webDir, "app.js"), "utf8"), "application/javascript; charset=utf-8");
    return;
  }
  if (request.method === "GET" && url.pathname === "/styles.css") {
    reply(response, 200, await fs.readFile(path.join(webDir, "styles.css"), "utf8"), "text/css; charset=utf-8");
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/generate") {
    const payload = await readJson(request);
    if (!payload.notes || typeof payload.notes !== "string") {
      reply(response, 400, { error: "notes is required" });
      return;
    }
    reply(response, 200, generatePlan(payload.notes));
    return;
  }

  reply(response, 404, { error: "Not found" });
}

export function createServer() {
  return http.createServer((request, response) => {
    handler(request, response).catch((error) => reply(response, 500, { error: error.message }));
  });
}

if (process.argv[1] && process.argv[1].endsWith("server.js")) {
  createServer().listen(port, host, () => {
    console.log(`Spec to Ship listening at http://${host}:${port}`);
  });
}
