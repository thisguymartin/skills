import { fileURLToPath } from 'node:url';
import { checkSource, loadManifest } from './lib/upstreams.ts';

try {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node scripts/check-upstreams.ts [source-id]\nChecks current default branches against recorded pins. Writes only temporary Git clones. Exit 1 on errors; changes alone exit 0.');
  } else {
    if (args.length > 1) throw new Error('Expected at most one source ID');
    const manifest = loadManifest(fileURLToPath(new URL('../upstreams/manifest.json', import.meta.url)));
    const sources = manifest.sources.filter((source) => !args[0] || source.id === args[0]);
    if (!sources.length) throw new Error(`Unknown source: ${args[0]}`);
    for (const source of sources) {
      try {
        console.log(`${source.id}: checking ${source.repository}`);
        const result = checkSource(source);
        console.log(`  recorded ${source.revision}\n  latest   ${result.latest}`);
        console.log(`  ${result.latest === source.revision ? 'Current at recorded pin' : 'Upstream revision changed'}`);
        if (result.licenseChanged) console.log('  License/notice changed: review redistribution terms before adapting');
        for (const local of result.affected) console.log(`  Manually review ${local}`);
        for (const path of result.referenceChanges) console.log(`  Studied reference changed: ${path}`);
        for (const path of result.missingPaths) console.log(`  Configured path removed/renamed: ${path}`);
        if (!result.affected.length && !result.referenceChanges.length && !result.licenseChanged) console.log('  No configured adaptation/reference/license changes');
      } catch (error) {
        console.error(`${source.id}: ${(error as Error).message}`);
        process.exitCode = 1;
      }
    }
  }
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
