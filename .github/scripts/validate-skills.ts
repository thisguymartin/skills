import { resolve } from 'node:path';
import { readdirSync, existsSync } from 'node:fs';
import { validateRepository } from './lib/validation.ts';

const root = resolve(import.meta.dirname,'../..');
const errors = validateRepository(root);
if (errors.length) {
  console.error(`FAIL: ${errors.length} problem(s)\n${errors.map(error => `  ${error}`).join('\n')}`);
  process.exitCode = 1;
} else {
  const count = readdirSync(root,{withFileTypes:true}).filter(entry => entry.isDirectory() && existsSync(resolve(root,entry.name,'SKILL.md'))).length;
  console.log(`OK: ${count} skills validated (layout, frontmatter, links, provenance and README)`);
}
