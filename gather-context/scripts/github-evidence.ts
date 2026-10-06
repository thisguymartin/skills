import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

export function githubCommands(args: string[]) {
  const { values } = parseArgs({ args, options: {
    repo: { type: 'string' }, pr: { type: 'string' }, issue: { type: 'string' },
    limit: { type: 'string', default: '30' }, 'dry-run': { type: 'boolean' }, help: { type: 'boolean' },
  } });
  if (values.help) return { help: true, commands: [], dryRun: true };
  if (!values.repo || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(values.repo) || values.repo.split('/').some(x => x.startsWith('-'))) throw new Error('--repo must be owner/repo');
  if (Boolean(values.pr) === Boolean(values.issue)) throw new Error('Supply exactly one of --pr or --issue');
  const id = values.pr ?? values.issue!;
  if (!/^[1-9]\d*$/.test(id)) throw new Error('Issue/PR number must be a positive integer');
  if (!/^\d+$/.test(values.limit!) || Number(values.limit) < 1 || Number(values.limit) > 100) throw new Error('--limit must be 1-100');
  const kind = values.pr ? 'pr' : 'issue';
  const fields = 'number,title,body,url,state,author,createdAt,updatedAt,labels' + (values.pr ? ',headRefOid,baseRefOid,headRefName,baseRefName,isDraft,statusCheckRollup' : '');
  const base = `repos/${values.repo}`;
  const page = `?per_page=${values.limit}&page=1`;
  const commands = [
    { label: 'metadata', args: [kind, 'view', id, '--repo', values.repo, '--json', fields], boundedPage: false },
    { label: 'discussion', args: ['api', '--method', 'GET', `${base}/issues/${id}/comments${page}`], boundedPage: true },
    ...(values.pr ? [
      { label: 'review-comments', args: ['api', '--method', 'GET', `${base}/pulls/${id}/comments${page}`], boundedPage: true },
      { label: 'reviews', args: ['api', '--method', 'GET', `${base}/pulls/${id}/reviews${page}`], boundedPage: true },
      { label: 'commits', args: ['api', '--method', 'GET', `${base}/pulls/${id}/commits${page}`], boundedPage: true },
    ] : []),
  ];
  return { help: false, commands, dryRun: !!values['dry-run'], limit: Number(values.limit) };
}

function main() {
  try {
    const request = githubCommands(process.argv.slice(2));
    if (request.help) {
      console.log('Usage: node github-evidence.ts --repo owner/repo (--pr N | --issue N) [--limit 1-100] [--dry-run]\nRead-only metadata and bounded first-page discussion/reviews. Private content stays local.');
      return;
    }
    if (request.dryRun) { console.log(JSON.stringify(request, null, 2)); return; }
    const results = request.commands.map(command => {
      try {
        const output = execFileSync('gh', command.args, { encoding: 'utf8', timeout: 20_000, maxBuffer: 5 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GH_PAGER: 'cat', GH_PROMPT_DISABLED: '1' } });
        const data: unknown = JSON.parse(output);
        return { ...command, retrievedAt: new Date().toISOString(), status: 'ok', data,
          coverage: command.boundedPage ? 'First page only; not a complete discussion/review history' : 'Metadata at retrieval time',
          possiblyTruncated: command.boundedPage && Array.isArray(data) && data.length >= request.limit! };
      } catch (error) {
        process.exitCode = 1;
        const failure = error as Error & { stderr?: Buffer | string };
        return { ...command, retrievedAt: new Date().toISOString(), status: 'error', error: String(failure.stderr || failure.message).slice(0,1000) };
      }
    });
    console.log(JSON.stringify({ source: 'GitHub CLI', results }, null, 2));
  } catch (error) { console.error((error as Error).message); process.exitCode = 1; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) main();
