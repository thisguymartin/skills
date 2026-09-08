import { fileURLToPath } from 'node:url';
import { exportReference, loadManifest } from './lib/upstreams.ts';

try {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node scripts/pull-upstream-reference.ts <source-id> [skill-name] [--latest]\nExports configured files and licenses into a new OS temporary directory. Defaults to the recorded pin. Never writes skills/ or runs upstream code.');
  } else {
    const latest = args.includes('--latest');
    const positional = args.filter((arg) => arg !== '--latest');
    if (!positional.length || positional.length > 2 || positional.some((arg) => arg.startsWith('-'))) throw new Error('Expected source ID, optional skill name, and optional --latest; use --help');
    const manifest = loadManifest(fileURLToPath(new URL('../upstreams/manifest.json', import.meta.url)));
    const source = manifest.sources.find((item) => item.id === positional[0]);
    if (!source) throw new Error(`Unknown source: ${positional[0]}`);
    const result = exportReference(source, { latest, local: positional[1] });
    console.log(`Reference revision: ${result.revision}\nReview directory: ${result.directory}\nTemporary reference only. Review manually; local skills and manifest were not modified.`);
  }
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
