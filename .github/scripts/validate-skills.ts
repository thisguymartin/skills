import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseDocument } from 'yaml';

export function validateFrontmatter(content: string, folder: string): string[] {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  if (!match) return ['missing or unterminated frontmatter'];
  const document = parseDocument(match[1], { prettyErrors: false });
  if (document.errors.length) return document.errors.map(error => `invalid YAML: ${error.message}`);
  const fields = document.toJS();
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return ['frontmatter must be a mapping'];
  const errors: string[] = [];
  for (const field of ['name', 'description']) {
    if (typeof fields[field] !== 'string' || !fields[field].trim()) errors.push(`${field} must be a nonempty string`);
  }
  if (typeof fields.name === 'string') {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.name) || fields.name.length > 64) errors.push('name must be at most 64 lowercase letters, digits and hyphens');
    if (fields.name !== folder) errors.push(`name must match folder ${folder}`);
  }
  if (typeof fields.description === 'string' && fields.description.length > 1024) errors.push('description exceeds 1024 characters');
  for (const field of ['license', 'compatibility', 'argument-hint']) {
    if (fields[field] !== undefined && typeof fields[field] !== 'string') errors.push(`${field} must be a string`);
  }
  return errors;
}

function markdownFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') return [];
    const path = join(root, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && entry.name.endsWith('.md') ? [path] : [];
  });
}

export function validateSkills(root: string) {
  const errors: string[] = [];
  const skills = readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules')
    .map(entry => join(root, entry.name, 'SKILL.md')).filter(path => existsSync(path));
  if (!skills.length) errors.push('No */SKILL.md files found');
  for (const path of skills) {
    for (const error of validateFrontmatter(readFileSync(path, 'utf8'), basename(dirname(path)))) errors.push(`${relative(root, path)}: ${error}`);
  }
  for (const path of markdownFiles(root)) {
    const content = readFileSync(path, 'utf8').replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '');
    for (const match of content.matchAll(/\]\(([^\n)]+)\)/g)) {
      const target = match[1].trim().replace(/^<([^>]+)>.*$/, '$1').replace(/\s+["'][\s\S]*$/, '').split('#')[0];
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      let decoded: string;
      try { decoded = decodeURIComponent(target); } catch { errors.push(`${relative(root, path)}: invalid link ${target}`); continue; }
      if (!existsSync(resolve(dirname(path), decoded))) errors.push(`${relative(root, path)}: missing local link ${target}`);
    }
  }
  return { count: skills.length, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const result = validateSkills(process.cwd());
  if (result.errors.length) {
    console.error(result.errors.join('\n'));
    process.exitCode = 1;
  } else console.log(`OK: ${result.count} skills; YAML, naming and local links validated`);
}
