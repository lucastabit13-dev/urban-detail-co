const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cli = path.resolve(__dirname, '../bin/urban-detail-co.cjs');

test('preview serves site and service worker without exposing other files', async t => {
  const child = spawn(process.execPath, [cli, '--port', '0']);
  t.after(() => child.kill());
  let output = '';
  const url = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', code => reject(new Error(`Server exited: ${code}`)));
    child.stdout.on('data', data => {
      output += data;
      const match = output.match(/http:\/\/localhost:(\d+)/);
      if (match) resolve(`http://127.0.0.1:${match[1]}`);
    });
  });
  const home = await fetch(url);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Urban Detail Co\./);
  assert.equal((await fetch(`${url}/sw.js`)).status, 200);
  for (const route of ['/package.json', '/security-hardening.sql', '/.env', '/toString', '/%2e%2e/package.json']) {
    assert.equal((await fetch(url + route)).status, 404);
  }
  assert.equal((await fetch(url, { method: 'POST' })).status, 405);
  assert.equal(await (await fetch(url, { method: 'HEAD' })).text(), '');
  child.kill();
  await once(child, 'exit');
});

test('export copies assets and refuses to overwrite an existing directory', t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'urban-detail-test-'));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const destination = path.join(temporary, 'website');
  assert.equal(spawnSync(process.execPath, [cli, 'export', destination]).status, 0);
  for (const file of ['index.html', 'sw.js', 'security-hardening.sql']) {
    assert.deepEqual(fs.readFileSync(path.join(destination, file)), fs.readFileSync(path.resolve(__dirname, '..', file)));
  }
  assert.equal(spawnSync(process.execPath, [cli, 'export', destination]).status, 1);
  assert.equal(spawnSync(process.execPath, [cli, '--port', '-1']).status, 1);
});
