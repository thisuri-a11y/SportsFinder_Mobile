const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'dist');
const port = Number(process.env.PORT || 8083);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
};

function resolveRequestPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  const requestedFile = path.resolve(root, `.${pathname}`);
  if (requestedFile !== root && !requestedFile.startsWith(`${root}${path.sep}`)) {
    return null;
  }
  return requestedFile;
}

const server = http.createServer((request, response) => {
  response.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  let requestedFile;
  try {
    requestedFile = resolveRequestPath(request.url || '/');
  } catch {
    response.writeHead(400).end('Invalid URL');
    return;
  }

  if (!requestedFile) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  let filePath = requestedFile;
  try {
    if (fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch {
    if (request.headers.accept?.includes('text/html')) {
      filePath = path.join(root, 'index.html');
    }
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }

    response.setHeader(
      'Content-Type',
      mimeTypes[path.extname(filePath)] || 'application/octet-stream',
    );
    response.setHeader('Content-Length', stats.size);
    if (request.method === 'HEAD') {
      response.writeHead(200).end();
      return;
    }

    response.writeHead(200);
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`SportFinder web preview: http://localhost:${port}`);
});
