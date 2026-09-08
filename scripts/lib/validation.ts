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

export function validateRepository(root: string): string[] {
  const errors: string[] = [];
  const skillsPath = join(root, 'skills');
  if (!existsSync(skillsPath)) return ['Missing skills directory'];
  const directories = readdirSync(skillsPath, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  if (!directories.length) errors.push('No skills found');
  for (const directory of directories) {
    const path = join(skillsPath, directory.name, 'SKILL.md');
    if (!existsSync(path)) { errors.push(`${directory.name}: missing SKILL.md`); continue; }
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
  const manifestPath = join(root, 'upstreams/manifest.json');
  if (existsSync(manifestPath)) {
    try {
      const manifest = loadManifest(manifestPath);
      const upstreamDoc = readFileSync(join(root, 'UPSTREAMS.md'), 'utf8');
      for (const source of manifest.sources) {
        if (!upstreamDoc.includes(source.revision)) errors.push(`${source.id}: pin missing from UPSTREAMS.md`);
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
