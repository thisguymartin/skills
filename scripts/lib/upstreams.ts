import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export type Source = {
  id: string;
  repository: string;
  revision: string;
  license: string;
  kind: 'adapted' | 'inspiration' | 'external';
  licenseFiles: string[];
  references: string[];
  adaptations: { local: string; sources: string[]; changes: string }[];
};
export type Manifest = { version: number; researchedOn: string; sources: Source[] };

function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function safePath(value: unknown): asserts value is string {
  requireValue(typeof value === 'string' && /^[a-zA-Z0-9_.@/-]+$/.test(value), `Invalid source path: ${value}`);
  requireValue(value.split('/').every((part) => part && part !== '.' && part !== '..' && part !== '.git' && !part.startsWith('-')), `Unsafe source path: ${value}`);
}

export function validateManifest(value: unknown): asserts value is Manifest {
  const manifest = value as Manifest;
  requireValue(manifest?.version === 1 && /^\d{4}-\d{2}-\d{2}$/.test(manifest.researchedOn), 'Invalid manifest version or research date');
  requireValue(Array.isArray(manifest.sources) && manifest.sources.length > 0, 'Manifest needs sources');
  const ids = new Set<string>();
  for (const source of manifest.sources) {
    requireValue(source && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.id) && !ids.has(source.id), 'Invalid or duplicate source ID');
    ids.add(source.id);
    requireValue(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(source.repository), `${source.id}: expected a public GitHub HTTPS repository`);
    requireValue(/^[a-f0-9]{40}$/.test(source.revision), `${source.id}: revision must be an exact 40-character SHA`);
    requireValue(['adapted', 'inspiration', 'external'].includes(source.kind), `${source.id}: invalid relationship kind`);
    requireValue(typeof source.license === 'string' && source.license.length > 0, `${source.id}: license missing`);
    requireValue(Array.isArray(source.licenseFiles) && source.licenseFiles.length > 0 && Array.isArray(source.references) && Array.isArray(source.adaptations), `${source.id}: invalid path collections`);
    const locals = new Set<string>();
    for (const adaptation of source.adaptations) {
      requireValue(/^skills\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(adaptation.local) && !locals.has(adaptation.local), `${source.id}: invalid or duplicate local adaptation`);
      locals.add(adaptation.local);
      requireValue(Array.isArray(adaptation.sources) && adaptation.sources.length > 0 && typeof adaptation.changes === 'string' && adaptation.changes.length > 0, `${source.id}: adaptation sources/changes missing`);
    }
    requireValue(source.kind === 'adapted' ? source.adaptations.length > 0 : source.adaptations.length === 0, `${source.id}: adaptations disagree with relationship kind`);
    for (const path of configuredPaths(source)) safePath(path);
  }
}

export function loadManifest(path: string): Manifest {
  const value: unknown = JSON.parse(readFileSync(path, 'utf8'));
  validateManifest(value);
  return value;
}

function configuredPaths(source: Source): string[] {
  return [...new Set([...source.licenseFiles, ...source.references, ...source.adaptations.flatMap((item) => item.sources)])];
}

function git(directory: string, ...args: string[]): Buffer {
  try {
    return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-C', directory, ...args], {
      timeout: 30_000, maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
  } catch (error) {
    const failure = error as Error & { stderr?: Buffer };
    throw new Error(`Git ${args[0]} failed: ${failure.stderr?.toString().trim() || failure.message}`);
  }
}

function withCheckout<T>(source: Source, action: (directory: string, latest: string) => T): T {
  const temporary = mkdtempSync(join(tmpdir(), 'thisguyskills-upstream-'));
  try {
    git(temporary, 'clone', '--quiet', '--no-checkout', '--depth', '1', '--', source.repository, 'reference');
    const directory = join(temporary, 'reference');
    const latest = git(directory, 'rev-parse', 'HEAD').toString().trim();
    if (latest !== source.revision) git(directory, 'fetch', '--quiet', '--depth', '1', 'origin', source.revision);
    git(directory, 'cat-file', '-e', `${source.revision}^{commit}`);
    return action(directory, latest);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

function trackedEntries(directory: string, revision: string) {
  return git(directory, 'ls-tree', '-r', '-z', revision).toString().split('\0').filter(Boolean).map((entry) => {
    const tab = entry.indexOf('\t');
    const [mode, type, object] = entry.slice(0, tab).split(' ');
    return { mode, type, object, path: entry.slice(tab + 1) };
  });
}

function matches(file: string, configured: string) {
  return file === configured || file.startsWith(`${configured}/`);
}

export function checkSource(source: Source) {
  return withCheckout(source, (directory, latest) => {
    const pinnedFiles = trackedEntries(directory, source.revision).map((entry) => entry.path);
    for (const path of configuredPaths(source)) requireValue(pinnedFiles.some((file) => matches(file, path)), `${source.id}: configured path missing at recorded pin: ${path}`);
    const latestFiles = trackedEntries(directory, latest).map((entry) => entry.path);
    const changedPaths = git(directory, 'diff', '--no-ext-diff', '--name-only', '--no-renames', '-z', source.revision, latest, '--').toString().split('\0').filter(Boolean);
    const changed = (paths: string[]) => changedPaths.some((file) => paths.some((path) => matches(file, path)));
    const licenseChanged = changed(source.licenseFiles);
    return {
      latest, changedPaths, licenseChanged,
      affected: source.adaptations.filter((item) => licenseChanged || changed(item.sources)).map((item) => item.local),
      referenceChanges: source.references.filter((path) => changed([path])),
      missingPaths: configuredPaths(source).filter((path) => !latestFiles.some((file) => matches(file, path))),
    };
  });
}

export function exportReference(source: Source, options: { latest?: boolean; local?: string } = {}) {
  const adaptation = options.local ? source.adaptations.find((item) => item.local === options.local || item.local === `skills/${options.local}`) : undefined;
  if (options.local && !adaptation) throw new Error(`Unknown adaptation: ${options.local}`);
  const paths = adaptation ? [...source.licenseFiles, ...adaptation.sources] : configuredPaths(source);
  for (const path of paths) safePath(path);
  return withCheckout(source, (directory, latest) => {
    const revision = options.latest ? latest : source.revision;
    const entries = trackedEntries(directory, revision);
    for (const path of paths) requireValue(entries.some((entry) => matches(entry.path, path)), `Configured path missing at ${revision}: ${path}`);
    const selected = entries.filter((entry) => paths.some((path) => matches(entry.path, path)));
    for (const entry of selected) {
      safePath(entry.path);
      requireValue(entry.type === 'blob' && ['100644', '100755'].includes(entry.mode), `Export requires a regular file: ${entry.path}`);
    }
    const destination = mkdtempSync(join(tmpdir(), 'thisguyskills-review-'));
    try {
      for (const entry of selected) {
        const target = join(destination, entry.path);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, git(directory, 'cat-file', 'blob', entry.object), { flag: 'wx', mode: 0o600 });
      }
      writeFileSync(join(destination, 'REVIEW-ORIGIN.json'), JSON.stringify({ source: source.id, repository: source.repository, revision, exportedPaths: paths }, null, 2) + '\n', { flag: 'wx' });
      return { directory: destination, revision };
    } catch (error) {
      rmSync(destination, { recursive: true, force: true });
      throw error;
    }
  });
}
