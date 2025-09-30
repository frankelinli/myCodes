import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const root = resolve(process.cwd(), 'dist');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8'
};

createServer(async (req, res) => {
  try {
    const url = decodeURI(req.url || '/');
    const filePath = resolve(root, url === '/' ? 'index.html' : url.slice(1));
    if (!existsSync(filePath)) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }
    const type = mime[extname(filePath)] || 'application/octet-stream';
    res.setHeader('Content-Type', type);
    if (type.startsWith('text/') || type.includes('json') || type.includes('xml')) {
      const content = await readFile(filePath);
      res.end(content);
    } else {
      createReadStream(filePath).pipe(res);
    }
  } catch (e) {
    res.statusCode = 500;
    res.end('Server Error');
  }
}).listen(port, () => {
  console.log(`Preview at http://localhost:${port}`);
});
