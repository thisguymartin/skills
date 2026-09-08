import { fileURLToPath } from 'node:url';
import { validateRepository } from './lib/validation.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
try {
  if (process.argv.length > 2) throw new Error('Usage: node scripts/validate-skills.ts');
  const errors = validateRepository(root);
  if (errors.length) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
  } else console.log('Skill structure, local Markdown links, and upstream provenance checks passed. Behavioral review is separate.');
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
