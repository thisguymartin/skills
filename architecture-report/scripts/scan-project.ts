#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const HELP = `Usage: node scan-project.ts --root <repo> [--app <subdir>] [--out scan.json] [--max-read-kb 256]

Inventories a repository from \`git ls-files\` without running any of its code:
  workspaces and the dependency edges between them
  infra and deploy files, CI workflows
  schema and migration files
  route and handler files
  queue, event and job keywords by file
  environment variable names (names only, never values)
  external hosts referenced in source
  largest tracked files

Writes <out> (JSON) and <out>.md (summary). --app limits the scan to one subdirectory
but keeps the workspace graph for the whole repo so cross-package edges stay visible.

Options:
  --root <path>       repository root (default: cwd)
  --app <subdir>      scan only this directory, relative to root
  --out <file>        output JSON path (default: ./scan.json)
  --max-read-kb <n>   skip reading files larger than this for keyword scans (default 256)
  --help              show this help`;

type Workspace = {
  dir: string;
  name: string;
  private: boolean;
  scripts: string[];
  dependsOn: string[];
  frameworks: string[];
};
type Hit = { file: string; matches: string[] };
type Scan = {
  root: string;
  app: string | null;
  head: string | null;
  branch: string | null;
  dirty: number;
  generatedAt: string;
  fileCount: number;
  languages: Record<string, number>;
  workspaces: Workspace[];
  infra: string[];
  ci: string[];
  schema: string[];
  routes: string[];
  queues: Hit[];
  envVars: Record<string, string[]>;
  externalHosts: Record<string, string[]>;
  largest: { file: string; kb: number }[];
  docs: string[];
  warnings: string[];
};

const { values } = parseArgs({
  options: {
    root: { type: 'string', default: process.cwd() },
    app: { type: 'string' },
    out: { type: 'string', default: 'scan.json' },
    'max-read-kb': { type: 'string', default: '256' },
    help: { type: 'boolean', default: false },
  },
});
if (values.help) {
  console.log(HELP);
  process.exit(0);
}

const root = resolve(values.root as string);
const app = values.app ? values.app.replace(/\/+$/, '') : null;
const maxReadBytes = Number(values['max-read-kb']) * 1024;
const warnings: string[] = [];

function git(args: string[]): string | null {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

const lsOut = git(['ls-files', '-z', ...(app ? [app] : [])]);
if (lsOut === null) {
  console.error(`not a git repository or git unavailable: ${root}`);
  process.exit(1);
}
const files = lsOut.split('\0').filter(Boolean);
const ciFiles = app ? (git(['ls-files', '-z', '--', '.github/workflows', '.gitlab-ci.yml', '.circleci', 'bitbucket-pipelines.yml', 'Jenkinsfile', '.buildkite']) ?? '').split('\0').filter(Boolean) : [];
const head = git(['rev-parse', 'HEAD']);
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
const dirty = (git(['status', '--porcelain']) ?? '').split('\n').filter(Boolean).length;

const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|go|py|rb|rs|java|kt|cs|php|sql|graphql|gql|prisma|yml|yaml|toml|json|tf|hcl|env\.example|sh)$/i;
const SKIP_DIRS = /(^|\/)(node_modules|dist|build|\.next|\.turbo|coverage|vendor|__generated__|gql|generated)\//;
const LANG_EXT: Record<string, string> = {
  ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript',
  go: 'Go', py: 'Python', rb: 'Ruby', rs: 'Rust', java: 'Java', kt: 'Kotlin', cs: 'C#', php: 'PHP', sql: 'SQL',
  graphql: 'GraphQL', gql: 'GraphQL', prisma: 'Prisma', tf: 'Terraform', hcl: 'HCL', sh: 'Shell',
  css: 'CSS', scss: 'SCSS', md: 'Markdown', mdx: 'Markdown', yml: 'YAML', yaml: 'YAML', json: 'JSON', toml: 'TOML',
};
const INFRA = /(^|\/)(vercel\.json|wrangler\.(toml|json|jsonc)|fly\.toml|serverless\.(yml|yaml|ts|js)|sst\.config\.(ts|js)|cdk\.json|template\.(yml|yaml)|samconfig\.toml|Dockerfile[^/]*|docker-compose[^/]*\.ya?ml|Procfile|railway\.(json|toml)|render\.yaml|netlify\.toml|app\.yaml|.*\.tf|terragrunt\.hcl|Pulumi\.ya?ml|k8s\/.*\.ya?ml|helm\/.*|charts\/.*|cloudbuild\.yaml|amplify\.yml|firebase\.json|doppler\.yaml|turbo\.json|pnpm-workspace\.yaml)$/i;
const CI = /^(\.github\/workflows\/.*\.ya?ml|\.gitlab-ci\.yml|\.circleci\/config\.yml|bitbucket-pipelines\.yml|Jenkinsfile|\.buildkite\/.*)$/i;
const SCHEMA = /(^|\/)(schema\.(graphql|gql|prisma|sql|json)|.*\.graphql|.*\.gql|.*\.prisma|migrations?\/.*\.(sql|ts|js)|drizzle\/.*\.sql|.*\.schema\.(ts|js)|openapi\.(ya?ml|json)|swagger\.(ya?ml|json)|codegen\.(ts|yml|yaml))$/i;
const ROUTE = /(^|\/)(app\/.*\/(page|route|layout)\.(tsx?|jsx?)|src\/pages\/.*\.(tsx?|jsx?)|src\/app\/.*\/(page|route|layout)\.(tsx?|jsx?)|pages\/api\/.*|api\/.*\.(ts|js|go|py)|routes?\/.*\.(ts|js|go|py|rb)|handlers?\/.*\.(ts|js|go|py)|functions?\/.*\.(ts|js|go|py)|controllers?\/.*\.(ts|js|go|py|rb)|resolvers?\/.*\.(ts|js|go|py)|middleware\.(ts|js)|server\.(ts|js|go|py)|cmd\/.*\/main\.go|main\.(go|py))$/i;
const DOCS = /(^|\/)(README[^/]*|CLAUDE\.md|AGENTS\.md|ARCHITECTURE[^/]*|CONTRIBUTING[^/]*|docs\/.*\.mdx?|\.context\/.*\.md|adr\/.*|decisions\/.*)$/i;
const QUEUE_WORDS = ['SQS', 'EventBridge', 'SNS', 'Kinesis', 'Kafka', 'RabbitMQ', 'BullMQ', 'pubsub', 'PubSub', 'Queue', 'cron', 'schedule', 'webhook', 'Webhook', 'Lambda', 'DynamoDB', 'ElectroDB', 'S3Client', 'Redis', 'Postgres', 'prisma', 'drizzle', 'mongoose', 'Auth0', 'ConfigCat', 'LaunchDarkly', 'mixpanel', 'Mixpanel', 'segment', 'Sentry', 'datadog', 'Datadog', 'Stripe', 'Twilio', 'Resend', 'SendGrid', 'openai', 'OpenAI', 'anthropic', 'Anthropic'];
const QUEUE_RE = new RegExp(`\\b(${QUEUE_WORDS.join('|')})\\b`, 'g');
const ENV_RE = /process\.env\.([A-Z][A-Z0-9_]{2,})|os\.Getenv\("([A-Z][A-Z0-9_]{2,})"\)|os\.environ(?:\.get)?\[?\(?["']([A-Z][A-Z0-9_]{2,})["']|env\(["']([A-Z][A-Z0-9_]{2,})["']\)|import\.meta\.env\.([A-Z][A-Z0-9_]{2,})|\$\{?([A-Z][A-Z0-9_]{3,})\}?(?=[^A-Za-z0-9_]|$)/g;
const HOST_RE = /https?:\/\/([a-z0-9][a-z0-9.-]*\.[a-z]{2,})(?::\d+)?/gi;
const LOCAL_HOSTS = /^(localhost|127\.0\.0\.1|example\.com|example\.org|schema\.org|www\.w3\.org|json-schema\.org|github\.com|www\.github\.com|npmjs\.com|www\.npmjs\.com|developer\.mozilla\.org|reactjs\.org|react\.dev|nextjs\.org|nodejs\.org|docs\.[a-z0-9.-]+|.*\.readthedocs\.io|stackoverflow\.com|google\.com|www\.google\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|unpkg\.com|cdn\.jsdelivr\.net)$/i;

const workspaces: Workspace[] = [];
const languages: Record<string, number> = {};
const infra: string[] = [];
const ci: string[] = [];
const schema: string[] = [];
const routes: string[] = [];
const docs: string[] = [];
const queues: Hit[] = [];
const envVars: Record<string, Set<string>> = {};
const externalHosts: Record<string, Set<string>> = {};
const sizes: { file: string; kb: number }[] = [];

const allPackageJsons = (git(['ls-files', '-z', '--', 'package.json', '*/package.json', '**/package.json']) ?? '')
  .split('\0')
  .filter((f) => f && !SKIP_DIRS.test(f + '/'));

const nameByDir = new Map<string, string>();
for (const pj of allPackageJsons) {
  try {
    const json = JSON.parse(readFileSync(join(root, pj), 'utf8'));
    const dir = dirname(pj) === '.' ? '.' : dirname(pj);
    const name = json.name ?? dir;
    nameByDir.set(dir, name);
    const deps = { ...(json.dependencies ?? {}), ...(json.devDependencies ?? {}), ...(json.peerDependencies ?? {}) };
    const frameworks = Object.keys(deps).filter((d) =>
      /^(next|react|vue|svelte|express|fastify|hono|koa|nestjs|@nestjs\/core|@apollo\/server|@apollo\/client|@tanstack\/react-query|graphql-yoga|prisma|@prisma\/client|drizzle-orm|electrodb|@aws-sdk\/client-[a-z0-9-]+|aws-cdk-lib|sst|serverless|@auth0\/[a-z0-9-]+|mixpanel-browser|@sentry\/[a-z0-9-]+|dd-trace|configcat-js|stripe|openai|@anthropic-ai\/sdk|@trpc\/server|zod)$/.test(d),
    );
    workspaces.push({
      dir,
      name,
      private: Boolean(json.private),
      scripts: Object.keys(json.scripts ?? {}),
      dependsOn: [],
      frameworks,
    });
  } catch (e) {
    warnings.push(`could not parse ${pj}: ${(e as Error).message}`);
  }
}
const internalNames = new Set(nameByDir.values());
for (const ws of workspaces) {
  const pj = JSON.parse(readFileSync(join(root, ws.dir === '.' ? 'package.json' : join(ws.dir, 'package.json')), 'utf8'));
  const deps = { ...(pj.dependencies ?? {}), ...(pj.devDependencies ?? {}) };
  ws.dependsOn = Object.keys(deps).filter((d) => internalNames.has(d) && d !== ws.name).sort();
}

for (const file of files) {
  if (SKIP_DIRS.test(file)) continue;
  const ext = file.includes('.') ? file.slice(file.lastIndexOf('.') + 1).toLowerCase() : '';
  const lang = LANG_EXT[ext];
  if (lang) languages[lang] = (languages[lang] ?? 0) + 1;
  if (INFRA.test(file)) infra.push(file);
  if (CI.test(file)) ci.push(file);
  if (SCHEMA.test(file)) schema.push(file);
  if (ROUTE.test(file) && !/\.(test|spec|stories)\./.test(file)) routes.push(file);
  if (DOCS.test(file)) docs.push(file);

  let size = 0;
  try {
    size = statSync(join(root, file)).size;
  } catch {
    continue;
  }
  sizes.push({ file, kb: Math.round(size / 1024) });
  if (!SOURCE_EXT.test(file) || size > maxReadBytes) continue;

  let text: string;
  try {
    text = readFileSync(join(root, file), 'utf8');
  } catch {
    continue;
  }
  if (/(\.(test|spec|stories|visual\.spec)\.|__mocks__\/|__tests__\/|\/e2e(-visual)?\/|\/evals?\/|\/fixtures?\/)/.test(file)) continue;
  const qm = new Set<string>();
  for (const m of text.matchAll(QUEUE_RE)) qm.add(m[1]);
  if (qm.size) queues.push({ file, matches: [...qm].sort() });

  const ws = workspaceFor(file);
  if (!/\.env\.example$/.test(file)) {
    for (const m of text.matchAll(ENV_RE)) {
      const name = m.slice(1).find(Boolean);
      if (!name || /^(PATH|HOME|PWD|SHELL|USER|TERM|LANG|NODE_ENV|CI)$/.test(name)) continue;
      if (m[6] && !/(ya?ml|toml|sh|Dockerfile)$/i.test(file)) continue;
      (envVars[ws] ??= new Set()).add(name);
    }
  } else {
    for (const line of text.split('\n')) {
      const m = /^\s*([A-Z][A-Z0-9_]{2,})\s*=/.exec(line);
      if (m) (envVars[ws] ??= new Set()).add(m[1]);
    }
  }
  for (const m of text.matchAll(HOST_RE)) {
    const host = m[1].toLowerCase();
    if (LOCAL_HOSTS.test(host) || /\.(example|test|invalid|local)$|^example\./.test(host)) continue;
    (externalHosts[host] ??= new Set()).add(ws);
  }
}

function workspaceFor(file: string): string {
  let best = '.';
  for (const dir of nameByDir.keys()) {
    if (dir !== '.' && file.startsWith(dir + '/') && dir.length > best.length) best = dir;
  }
  return best;
}

const scan: Scan = {
  root,
  app,
  head,
  branch,
  dirty,
  generatedAt: new Date().toISOString(),
  fileCount: files.length,
  languages: Object.fromEntries(Object.entries(languages).sort((a, b) => b[1] - a[1])),
  workspaces: workspaces.sort((a, b) => a.dir.localeCompare(b.dir)),
  infra: infra.sort(),
  ci: [...new Set([...ci, ...ciFiles.filter((f) => CI.test(f))])].sort(),
  schema: schema.sort(),
  routes: routes.sort(),
  queues: queues.sort((a, b) => b.matches.length - a.matches.length || a.file.localeCompare(b.file)),
  envVars: Object.fromEntries(Object.entries(envVars).map(([k, v]) => [k, [...v].sort()])),
  externalHosts: Object.fromEntries(
    Object.entries(externalHosts)
      .map(([k, v]) => [k, [...v].sort()] as [string, string[]])
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])),
  ),
  largest: sizes.sort((a, b) => b.kb - a.kb).slice(0, 15),
  docs: docs.sort(),
  warnings,
};

const outPath = resolve(values.out as string);
if (existsSync(outPath) || existsSync(outPath + '.md')) {
  console.error(`refusing to overwrite ${outPath} or its Markdown summary; pick a new --out`);
  process.exit(1);
}
writeFileSync(outPath, JSON.stringify(scan, null, 2), { flag: 'wx' });
writeFileSync(outPath + '.md', summary(scan), { flag: 'wx' });
console.log(`wrote ${relative(process.cwd(), outPath)} and ${relative(process.cwd(), outPath)}.md`);
console.log(`${scan.fileCount} tracked files, ${scan.workspaces.length} workspaces, ${scan.routes.length} route files, ${Object.keys(scan.externalHosts).length} external hosts`);
for (const w of warnings) console.warn(`warning: ${w}`);

function summary(s: Scan): string {
  const lines: string[] = [];
  lines.push(`# Scan of ${s.root}${s.app ? ` (app ${s.app})` : ''}`);
  lines.push('');
  lines.push(`Branch ${s.branch ?? 'unknown'} at ${s.head ?? 'unknown'}, ${s.dirty} dirty paths, ${s.fileCount} tracked files, generated ${s.generatedAt}.`);
  lines.push('');
  lines.push('## Languages');
  lines.push('');
  for (const [k, v] of Object.entries(s.languages)) lines.push(`- ${k}: ${v} files`);
  lines.push('');
  lines.push('## Workspaces');
  lines.push('');
  lines.push('| Dir | Name | Frameworks | Depends on (internal) |');
  lines.push('|---|---|---|---|');
  for (const w of s.workspaces) lines.push(`| ${w.dir} | ${w.name} | ${w.frameworks.join(', ')} | ${w.dependsOn.join(', ')} |`);
  lines.push('');
  section('Infra and deploy files', s.infra);
  section('CI', s.ci);
  section('Schema and migrations', s.schema);
  section('Route and handler files', s.routes, 80);
  section('Docs worth reading first', s.docs, 40);
  lines.push('## Integration keywords by file (top 40)');
  lines.push('');
  for (const q of s.queues.slice(0, 40)) lines.push(`- ${q.file}: ${q.matches.join(', ')}`);
  lines.push('');
  lines.push('## Environment variable names (values never read)');
  lines.push('');
  for (const [ws, names] of Object.entries(s.envVars)) lines.push(`- ${ws}: ${names.join(', ')}`);
  lines.push('');
  lines.push('## External hosts referenced in source');
  lines.push('');
  for (const [host, wss] of Object.entries(s.externalHosts)) lines.push(`- ${host}: ${wss.join(', ')}`);
  lines.push('');
  lines.push('## Largest tracked files');
  lines.push('');
  for (const f of s.largest) lines.push(`- ${f.file}: ${f.kb} KB`);
  lines.push('');
  if (s.warnings.length) {
    lines.push('## Warnings');
    lines.push('');
    for (const w of s.warnings) lines.push(`- ${w}`);
    lines.push('');
  }
  return lines.join('\n');

  function section(title: string, items: string[], cap = 200) {
    lines.push(`## ${title}`);
    lines.push('');
    if (!items.length) lines.push('- none found');
    for (const i of items.slice(0, cap)) lines.push(`- ${i}`);
    if (items.length > cap) lines.push(`- … ${items.length - cap} more in the JSON`);
    lines.push('');
  }
}
