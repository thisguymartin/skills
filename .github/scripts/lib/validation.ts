import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { loadManifest } from './upstreams.ts';

function markdownFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') return [];
    const path = join(root, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && path.endsWith('.md') ? [path] : [];
  });
}

// Skills live flat at the repository root. Every other visible root directory must be listed here.
export const NON_SKILL_DIRECTORIES = new Set(['docs', 'node_modules']);
// Skill folders are flat too: supporting files sit next to SKILL.md. `agents/` holds host metadata such as Codex's agents/openai.yaml.
export const SKILL_SUBDIRECTORIES = new Set(['agents', 'scripts']);

export function validateRepository(root: string): string[] {
  const errors: string[] = [];
  const directories = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && !NON_SKILL_DIRECTORIES.has(entry.name));
  if (!directories.length) errors.push('No skills found');
  const readmePath = join(root,'README.md');
  const readme = existsSync(readmePath) ? readFileSync(readmePath,'utf8') : undefined;
  for (const directory of directories) {
    const path = join(root, directory.name, 'SKILL.md');
    if (!existsSync(path)) { errors.push(`${directory.name}: root directories must be skills with a SKILL.md (or be added to NON_SKILL_DIRECTORIES)`); continue; }
    for (const entry of readdirSync(join(root, directory.name), { withFileTypes: true })) {
      if (entry.isDirectory() && !SKILL_SUBDIRECTORIES.has(entry.name)) errors.push(`${directory.name}/${entry.name}: keep skill folders flat; put supporting files next to SKILL.md`);
    }
    const content = readFileSync(path, 'utf8');
    const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]+)$/);
    if (!match) { errors.push(`${directory.name}: missing frontmatter or body`); continue; }
    const fields: Record<string, string> = {};
    for (const line of match[1].split(/\r?\n/)) {
      const field = line.match(/^(name|description|license): (.+)$/);
      if (!field || fields[field[1]]) { errors.push(`${directory.name}: use unique scalar name/description/license frontmatter`); continue; }
      try {
        const raw = field[2];
        fields[field[1]] = raw.startsWith('"') ? JSON.parse(raw) : raw;
        if (typeof fields[field[1]] !== 'string' || (!raw.startsWith('"') && /[:#\[\]{}]|^[>|'&*!]/.test(raw))) throw new Error('Quote YAML punctuation');
      } catch { errors.push(`${directory.name}: invalid scalar value for ${field[1]}`); }
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.name || '') || fields.name?.length > 64 || fields.name !== directory.name) errors.push(`${directory.name}: name must match folder and Agent Skills naming rules`);
    if (!fields.description?.trim() || fields.description.length > 1024) errors.push(`${directory.name}: description must be 1-1024 characters`);
    if (content.split('\n').length > 200) errors.push(`${directory.name}: entrypoint exceeds this repo's 200-line limit`);
    if (/\b(?:TODO|TBD|FIXME)\b|\[INSERT\b/.test(content)) errors.push(`${directory.name}: unfinished scaffold text`);
    if (readme !== undefined) {
      if (!readme.includes(`### [${directory.name}](./${directory.name}/)`)) errors.push(`${directory.name}: README section missing`);
      if (!readme.includes(`| [${directory.name}](#${directory.name}) |`)) errors.push(`${directory.name}: README install row missing`);
    }
  }
  for (const path of markdownFiles(root)) {
    const content = readFileSync(path, 'utf8').replace(/```[^\n]*\n[\s\S]*?```/g, '');
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const href = match[1].replace(/^<|>$/g, '').split('#')[0];
      if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
      const destination = resolve(dirname(path), decodeURIComponent(href));
      if (!existsSync(destination)) errors.push(`${relative(root, path)}: missing linked file ${href}`);
    }
  }
  const manifestPath = join(root, '.github/upstreams.json');
  if (existsSync(manifestPath)) {
    try {
      const manifest = loadManifest(manifestPath);
      const upstreamDoc = readFileSync(join(root, 'docs/upstreams.md'), 'utf8');
      for (const source of manifest.sources) {
        if (!upstreamDoc.includes(source.revision)) errors.push(`${source.id}: pin missing from docs/upstreams.md`);
        for (const adaptation of source.adaptations) {
          if (!existsSync(join(root, adaptation.local, 'SKILL.md'))) errors.push(`${adaptation.local}: mapped skill missing`);
          const notice = join(root, adaptation.local, 'LICENSE.txt');
          if (!existsSync(notice) || !lstatSync(notice).isFile() || !readFileSync(notice, 'utf8').includes('Permission is hereby granted')) errors.push(`${adaptation.local}: bundled license notice missing`);
        }
      }
    } catch (error) { errors.push(`Manifest/provenance: ${(error as Error).message}`); }
  }
  return errors;
}
