// Servidor estático mínimo para os testes de fumaça: serve dist/ em /raio-x-do-projeto/, como o GitHub Pages.
// (O "vite preview" 8 devolve 404 para pedidos com Sec-Fetch-Dest: script, que todo navegador envia.)
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const RAIZ = resolve("dist");
const BASE = "/raio-x-do-projeto/";
const PORTA = Number(process.env.PORTA || 4173);
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".gz": "application/gzip",
  ".bcmap": "application/octet-stream",
  ".pfb": "application/octet-stream",
  ".icc": "application/octet-stream",
};

createServer((req, res) => {
  const caminho = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  if (!caminho.startsWith(BASE)) {
    res.writeHead(404).end();
    return;
  }
  let arquivo = normalize(join(RAIZ, caminho.slice(BASE.length)));
  if (!arquivo.startsWith(RAIZ)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(arquivo) && statSync(arquivo).isDirectory()) arquivo = join(arquivo, "index.html");
  if (!existsSync(arquivo)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { "Content-Type": TIPOS[extname(arquivo)] ?? "application/octet-stream" });
  createReadStream(arquivo).pipe(res);
}).listen(PORTA, () => console.log(`servindo dist/ em http://localhost:${PORTA}${BASE}`));
