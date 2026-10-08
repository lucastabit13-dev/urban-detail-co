#!/usr/bin/env node
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const files = ['index.html', 'sw.js', 'security-hardening.sql'];

async function main() {
  if (args[0] === '--help' || args[0] === '-h') {
    console.log('Usage: urban-detail-co [--port 3000]\n       urban-detail-co export <directory>\n\nPreview at localhost, or copy website files to a new directory.');
    return;
  }
  if (args[0] === 'export' && args.length === 2) {
    const destination = path.resolve(args[1]);
    // A new directory prevents accidentally replacing someone\'s files.
    fs.mkdirSync(destination);
    for (const file of files) fs.copyFileSync(path.join(root, file), path.join(destination, file), fs.constants.COPYFILE_EXCL);
    console.log(`Website exported to ${destination}`);
    return;
  }
  if (args.length && !(args.length === 2 && args[0] === '--port')) {
    throw new Error('Unknown arguments. Run urban-detail-co --help.');
  }
  const value = args[1] ?? process.env.PORT ?? '3000';
  if (!/^\d+$/.test(value) || Number(value) > 65535) throw new Error('Port must be an integer from 0 to 65535.');
  const server = http.createServer((req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end();
      return;
    }
    const pathname = req.url.split('?')[0];
    const file = { '/': 'index.html', '/index.html': 'index.html', '/sw.js': 'sw.js' }[pathname];
    if (!file || !files.includes(file)) { res.writeHead(404); res.end('Not found'); return; }
    fs.readFile(path.join(root, file), (error, data) => {
      if (error) { res.writeHead(500); res.end('Unable to read website file'); return; }
      res.writeHead(200, {
        'Content-Type': file.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      });
      res.end(req.method === 'HEAD' ? undefined : data);
    });
  });
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(Number(value), '127.0.0.1', () => console.log(`Urban Detail Co. running at http://localhost:${server.address().port}\nPress Ctrl+C to stop.`));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
