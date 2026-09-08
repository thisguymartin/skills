import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, symlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { checkSource, exportReference, validateManifest, type Source } from './lib/upstreams.ts';
import { validateRepository } from './lib/validation.ts';

function fixture(t: { after: (fn: () => void) => void }) {
  const root = mkdtempSync(join(tmpdir(), 'thisguyskills-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function put(root: string, path: string, content: string) {
  const target = join(root, path);
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content);
}

function git(root: string, ...args: string[]) {
  return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function upstream(t: { after: (fn: () => void) => void }) {
  const root = fixture(t);
  git(root, 'init', '-q');
  git(root, 'config', 'user.name', 'Martin Patino');
  git(root, 'config', 'user.email', 'mpatino117@gmail.com');
  put(root, 'LICENSE', 'Synthetic license notice\n');
  put(root, 'skills/example/SKILL.md', 'Pinned source\n');
  put(root, 'skills/example/support.md', 'Supporting behavior\n');
  git(root, 'add', '.');
  git(root, '-c', 'commit.gpgsign=false', 'commit', '-qm', 'test: add synthetic upstream');
  const source: Source = {
    id: 'synthetic', repository: root, revision: git(root, 'rev-parse', 'HEAD'),
    kind: 'adapted', license: 'MIT', licenseFiles: ['LICENSE'], references: [],
    adaptations: [{ local: 'skills/example', sources: ['skills/example/SKILL.md', 'skills/example/support.md'], changes: 'Synthetic adaptation' }],
  };
  return { root, source };
}

test('reports changes only for affected source mappings and leaves inputs untouched', (t) => {
  const { root, source } = upstream(t);
  assert.deepEqual(checkSource(source).affected, []);
  put(root, 'unrelated.md', 'Other work\n');
  git(root, 'add', '.');
  git(root, '-c', 'commit.gpgsign=false', 'commit', '-qm', 'test: add unrelated change');
  assert.deepEqual(checkSource(source).affected, []);
  put(root, 'skills/example/support.md', 'Changed support\n');
  git(root, 'add', '.');
  git(root, '-c', 'commit.gpgsign=false', 'commit', '-qm', 'test: change support');
  const before = JSON.stringify(source);
  const result = checkSource(source);
  assert.deepEqual(result.affected, ['skills/example']);
  assert.deepEqual(result.changedPaths, ['skills/example/support.md', 'unrelated.md']);
  assert.equal(JSON.stringify(source), before);
  assert.equal(git(root, 'status', '--porcelain'), '');
});

test('license changes and deleted sources require manual review', (t) => {
  const { root, source } = upstream(t);
  put(root, 'LICENSE', 'Changed synthetic notice\n');
  rmSync(join(root, 'skills/example/support.md'));
  git(root, 'add', '-A');
  git(root, '-c', 'commit.gpgsign=false', 'commit', '-qm', 'test: change license and remove source');
  const result = checkSource(source);
  assert.equal(result.licenseChanged, true);
  assert.deepEqual(result.affected, ['skills/example']);
  assert.deepEqual(result.missingPaths, ['skills/example/support.md']);
});

test('reference export defaults to the pin, keeps notices, and never overwrites skills', (t) => {
  const { root, source } = upstream(t);
  put(root, 'skills/example/SKILL.md', 'Latest source\n');
  git(root, 'add', '.');
  git(root, '-c', 'commit.gpgsign=false', 'commit', '-qm', 'test: change source');
  const pinned = exportReference(source, { local: 'example' });
  t.after(() => rmSync(pinned.directory, { recursive: true, force: true }));
  assert.equal(readFileSync(join(pinned.directory, 'skills/example/SKILL.md'), 'utf8'), 'Pinned source\n');
  assert.equal(readFileSync(join(pinned.directory, 'LICENSE'), 'utf8'), 'Synthetic license notice\n');
  assert.equal(pinned.revision, source.revision);
  assert.ok(pinned.directory.startsWith(join(tmpdir(), 'thisguyskills-review-')));
  assert.equal(existsSync(join(pinned.directory, '.git')), false);
  assert.equal(readFileSync(join(root, 'skills/example/SKILL.md'), 'utf8'), 'Latest source\n');
  const latest = exportReference(source, { latest: true });
  t.after(() => rmSync(latest.directory, { recursive: true, force: true }));
  assert.equal(readFileSync(join(latest.directory, 'skills/example/SKILL.md'), 'utf8'), 'Latest source\n');
  assert.notEqual(latest.directory, pinned.directory);
  assert.throws(() => exportReference(source, { local: '../../skills' }), /unknown adaptation/i);
});

test('rejects symlinks in exported upstream paths', (t) => {
  const { root, source } = upstream(t);
  rmSync(join(root, 'skills/example/support.md'));
  symlinkSync('/etc/passwd', join(root, 'skills/example/support.md'));
  git(root, 'add', '.');
  git(root, '-c', 'commit.gpgsign=false', 'commit', '-qm', 'test: add unsafe source link');
  assert.throws(() => exportReference(source, { latest: true }), /regular file/i);
});

test('fails explicitly for an unavailable pinned revision', (t) => {
  const { source } = upstream(t);
  source.revision = '0'.repeat(40);
  assert.throws(() => checkSource(source), /git/i);
});

test('manifest rejects traversal, option-like repositories, duplicate IDs and invalid revisions', (t) => {
  const { source } = upstream(t);
  const valid = { version: 1, researchedOn: '2026-09-08', sources: [{ ...source, repository: 'https://github.com/example/skills' }] };
  assert.doesNotThrow(() => validateManifest(valid));
  for (const bad of [
    { ...valid, sources: [{ ...valid.sources[0], repository: '--upload-pack=oops' }] },
    { ...valid, sources: [{ ...valid.sources[0], revision: 'main' }] },
    { ...valid, sources: [{ ...valid.sources[0], references: ['../skills/secret'] }] },
    { ...valid, sources: [valid.sources[0], valid.sources[0]] },
  ]) assert.throws(() => validateManifest(bad));
});

test('structural validation checks real reference resolution and matching names', (t) => {
  const root = fixture(t);
  put(root, 'skills/example/SKILL.md', '---\nname: example\ndescription: "A focused example skill."\nlicense: MIT\n---\n\n# Example\n\nRead [guide](references/guide.md).\n');
  put(root, 'skills/example/references/guide.md', '# Guide\n\nUseful content.\n');
  assert.deepEqual(validateRepository(root), []);
  rmSync(join(root, 'skills/example/references/guide.md'));
  assert.ok(validateRepository(root).some((error) => error.includes('guide.md')));
  put(root, 'skills/example/SKILL.md', '---\nname: different\ndescription: "A focused example skill."\n---\n\n# Example\n');
  assert.ok(validateRepository(root).some((error) => error.includes('name')));
});
