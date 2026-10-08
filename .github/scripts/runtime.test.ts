import assert from 'node:assert/strict';
import { execFile, execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const node = process.execPath;
const diagrams = join(repo, 'feature-plan/scripts/diagrams.ts');
const scanner = join(repo, 'architecture-report/scripts/scan-project.ts');
const inbox = join(repo, 'excalidraw/scripts/excalidraw-inbox');
const spec = { diagrams: [{ id: 'today', title: 'Synthetic flow', W: 600, H: 200, nodes: [
  { id: 'web', title: 'Web', state: 'current', x: 20, y: 20, w: 200, h: 100 },
  { id: 'api', title: 'API', state: 'new', x: 350, y: 20, w: 200, h: 100 },
], edges: [{ from: 'web', to: 'api', label: 'request', state: 'new' }] }] };

function workspace(t: any) {
  const path = mkdtempSync(join(tmpdir(), 'skills-runtime-'));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  const input = join(path, 'spec.json');
  writeFileSync(input, JSON.stringify(spec));
  return { path, input };
}

function run(args: string[], env = process.env): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise(resolve => {
    execFile(node, args, { cwd: repo, env, timeout: 20_000 }, (error, stdout, stderr) => {
      resolve({ code: error ? typeof error.code === 'number' ? error.code : 1 : 0, stdout, stderr });
    });
  });
}

async function canvas(t: any, refuseSnapshot = false) {
  let elements: any[] = [{ id: 'today-web', type: 'text', text: 'Manual annotation', x: 0, y: 300, height: 30 }];
  const calls: { method: string; path: string; body: any }[] = [];
  let saved: any[] | undefined;
  const server = createServer(async (req, res) => {
    let input = '';
    for await (const chunk of req) input += chunk;
    const body = input ? JSON.parse(input) : undefined;
    calls.push({ method: req.method!, path: req.url!, body });
    res.setHeader('content-type', 'application/json');
    if (req.url === '/health') res.end(JSON.stringify({ service: 'mcp-excalidraw-canvas' }));
    else if (req.url === '/api/elements' && req.method === 'GET') res.end(JSON.stringify({ elements }));
    else if (req.url === '/api/snapshots') {
      if (refuseSnapshot) res.statusCode = 500;
      else saved = structuredClone(elements);
      res.end(JSON.stringify({ success: !refuseSnapshot, name: body.name }));
    } else if (req.url === '/api/elements/batch') {
      elements = body.replace ? body.elements : [...elements, ...body.elements];
      res.end(JSON.stringify({ success: true, count: body.elements.length }));
    } else { res.statusCode = 404; res.end('{}'); }
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(() => new Promise<void>(resolve => { server.closeAllConnections(); server.close(() => resolve()); }));
  const address = server.address() as { port: number };
  return { url: `http://127.0.0.1:${address.port}`, calls, elements: () => elements, saved: () => saved };
}

test('diagram regeneration refuses existing files without changing them', async t => {
  const { path, input } = workspace(t);
  const out = join(path, 'diagrams');
  assert.equal((await run([diagrams, '--spec', input, '--out', out, '--no-canvas'])).code, 0);
  const scene = join(out, 'today.excalidraw');
  writeFileSync(scene, 'Manually edited scene');
  const result = await run([diagrams, '--spec', input, '--out', out, '--no-canvas']);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /Refusing to overwrite/);
  assert.equal(readFileSync(scene, 'utf8'), 'Manually edited scene');
});

test('inline scene JSON prevents script termination and preserves labels', async t => {
  const { path, input } = workspace(t);
  const hostile = structuredClone(spec);
  const label = '</script><script>globalThis.syntheticMarker=1</script>';
  hostile.diagrams[0].nodes[0].title = label;
  writeFileSync(input, JSON.stringify(hostile));
  const out = join(path, 'diagrams');
  assert.equal((await run([diagrams, '--spec', input, '--out', out, '--no-canvas'])).code, 0);
  const inline = readFileSync(join(out, 'scenes.inline.json'), 'utf8');
  assert.ok(!inline.includes('<'));
  assert.deepEqual(JSON.parse(inline), JSON.parse(readFileSync(join(out, 'scenes.json'), 'utf8')));
  assert.ok(JSON.parse(inline).today.elements.some((element: any) => element.text === label));
});

test('canvas revisions preserve annotations and use valid unique bindings', async t => {
  const { path, input } = workspace(t);
  const mock = await canvas(t);
  const before = structuredClone(mock.elements()[0]);
  for (const revision of ['first', 'second']) {
    const result = await run([diagrams, '--spec', input, '--out', join(path, revision), '--canvas', mock.url]);
    assert.equal(result.code, 0, result.stderr);
  }
  assert.deepEqual(mock.elements()[0], before);
  assert.ok(!mock.calls.some(call => call.method === 'DELETE'));
  const ids = mock.elements().map(element => element.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const element of mock.elements()) {
    for (const id of [element.containerId, element.startBinding?.elementId, element.endBinding?.elementId, ...(element.boundElements ?? []).map((bound: any) => bound.id)].filter(Boolean)) assert.ok(ids.includes(id));
  }
});

test('explicit canvas replacement saves prior content first', async t => {
  const { path, input } = workspace(t);
  const mock = await canvas(t);
  const before = structuredClone(mock.elements());
  const result = await run([diagrams, '--spec', input, '--out', join(path, 'out'), '--canvas', mock.url, '--replace']);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(mock.saved(), before);
  assert.deepEqual(mock.calls.filter(call => call.method === 'POST').map(call => call.path), ['/api/snapshots', '/api/elements/batch']);
});

test('failed recovery snapshot blocks canvas replacement', async t => {
  const { path, input } = workspace(t);
  const mock = await canvas(t, true);
  const before = structuredClone(mock.elements());
  const result = await run([diagrams, '--spec', input, '--out', join(path, 'out'), '--canvas', mock.url, '--replace']);
  assert.notEqual(result.code, 0);
  assert.deepEqual(mock.elements(), before);
  assert.ok(!mock.calls.some(call => call.path === '/api/elements/batch'));
});

test('architecture scan preserves an existing Markdown sidecar', async t => {
  const { path } = workspace(t);
  const fixture = join(path, 'repo');
  mkdirSync(fixture);
  execFileSync('git', ['init', '-q', fixture]);
  writeFileSync(join(fixture, 'main.go'), 'package main\nfunc main() {}\n');
  execFileSync('git', ['add', 'main.go'], { cwd: fixture });
  const out = join(path, 'scan.json');
  writeFileSync(out + '.md', 'Manual notes');
  const refused = await run([scanner, '--root', fixture, '--out', out]);
  assert.notEqual(refused.code, 0);
  assert.equal(readFileSync(out + '.md', 'utf8'), 'Manual notes');
  assert.ok(!existsSync(out));
  const fresh = join(path, 'fresh.json');
  assert.equal((await run([scanner, '--root', fixture, '--out', fresh])).code, 0);
  assert.equal(JSON.parse(readFileSync(fresh, 'utf8')).languages.Go, 1);
});

function codexEnv() {
  const env = { ...process.env };
  for (const key of ['CLAUDE_CODE_SESSION_ID', 'CLAUDE_PID', 'EXCALIDRAW_SESSION_ID', 'EXCALIDRAW_OWNER_PID', 'EXPRESS_SERVER_URL', 'CODEX_PID', 'CODEX_THREAD_ID']) delete env[key];
  env.CODEX_SESSION_ID = 'synthetic-codex-session';
  return env;
}

test('inbox resolves a stable Codex session without Claude variables', async () => {
  const first = await run([inbox, '--url'], codexEnv());
  const second = await run([inbox, '--url'], codexEnv());
  assert.equal(first.code, 0, first.stderr);
  assert.equal(first.stdout, second.stdout);
  assert.match(first.stdout, /^http:\/\/127\.0\.0\.1:\d+\n$/);
});

test('bundled canvas launcher restores edits and saves intentional clearing on owner exit', async t => {
  const { path } = workspace(t);
  const fakeRepo = join(path, 'server');
  mkdirSync(join(fakeRepo, 'dist'), { recursive: true });
  writeFileSync(join(fakeRepo, 'package.json'), '{"type":"module"}');
  writeFileSync(join(fakeRepo, 'dist/server.js'), `
    import { createServer } from 'node:http';
    let elements = [];
    const server = createServer(async (req,res) => {
      let input = ''; for await (const chunk of req) input += chunk;
      res.setHeader('content-type','application/json');
      if (req.url === '/health') res.end(JSON.stringify({service:'mcp-excalidraw-canvas',pid:process.pid}));
      else if (req.url === '/api/elements') res.end(JSON.stringify({elements}));
      else if (req.url === '/api/elements/batch') { elements = JSON.parse(input).elements; res.end('{"success":true}'); }
      else {res.statusCode=404; res.end('{}');}
    });
    server.listen(Number(process.env.PORT), '127.0.0.1');
    process.on('SIGTERM', () => server.close());
  `);
  const probe = createServer();
  await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port;
  await new Promise<void>(resolve => probe.close(() => resolve()));
  const owner = spawn(node, ['-e', 'setInterval(()=>{},1000)'], { stdio: 'ignore' });
  t.after(() => owner.kill());
  const session = join(path, 'mcp/excalidraw-data/sessions/synthetic-codex-session');
  mkdirSync(session, { recursive: true });
  const scene = join(session, 'scene.excalidraw');
  const original = [{ id: 'manual-note', type: 'text', text: 'Retained annotation' }];
  writeFileSync(scene, JSON.stringify({ elements: original }));
  const url = `http://127.0.0.1:${port}`;
  const env = { ...codexEnv(), HOME: path, EXPRESS_SERVER_URL: url, EXCALIDRAW_REPO: fakeRepo, EXCALIDRAW_OWNER_PID: String(owner.pid), HOST: '127.0.0.1' };
  const started = await run([inbox, '--start'], env);
  assert.equal(started.code, 0, started.stderr + (existsSync(join(session, 'canvas.log')) ? readFileSync(join(session, 'canvas.log'), 'utf8') : ''));
  const ready = JSON.parse(readFileSync(join(session, 'canvas-ready.json'), 'utf8'));
  t.after(() => { try { process.kill(ready.pid, 'SIGTERM'); } catch {} });
  assert.deepEqual((await (await fetch(url + '/api/elements')).json()).elements, original);
  await fetch(url + '/api/elements/batch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ elements: [], replace: true }) });
  owner.kill();
  for (let i = 0; i < 40 && JSON.parse(readFileSync(scene, 'utf8')).elements.length; i++) await sleep(100);
  assert.deepEqual(JSON.parse(readFileSync(scene, 'utf8')).elements, []);
  for (let i = 0; i < 40; i++) {
    if (!(await fetch(url + '/health').catch(() => null))) return;
    await sleep(100);
  }
  assert.fail('Canvas remained alive after its owner exited');
});
