import { existsSync, opendirSync, createReadStream, statSync, realpathSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

type Options = { provider: string; root: string; query: string; project?: string; session?: string; since?: number; messages: boolean; limit: number; maxFiles: number; maxBytes: number };
export function historyOptions(args: string[]) {
  const { values } = parseArgs({ args, options: {
    provider: { type: 'string', default: 'claude' }, root: { type: 'string' }, query: { type: 'string' }, project: { type: 'string' }, session: { type: 'string' },
    since: { type: 'string' }, messages: { type: 'boolean' }, limit: { type: 'string', default: '10' },
    'max-files': { type: 'string', default: '500' }, 'max-bytes': { type: 'string', default: '52428800' }, help: { type: 'boolean' },
  } });
  if (values.help) return null;
  if (!['claude','codex'].includes(values.provider!)) throw new Error('--provider must be claude or codex');
  if (!values.query?.trim()) throw new Error('--query is required');
  if (values.messages && !values.session) throw new Error('--messages requires an exact --session ID');
  if (values.session && !/^[A-Za-z0-9-]+$/.test(values.session)) throw new Error('Invalid session ID');
  const count = (value: string, min: number, max: number, name: string) => {
    if (!/^\d+$/.test(value) || Number(value) < min || Number(value) > max) throw new Error(`${name} must be ${min}-${max}`);
    return Number(value);
  };
  const since = values.since ? Date.parse(values.since) : undefined;
  if (since !== undefined && !Number.isFinite(since)) throw new Error('Invalid --since date');
  return { provider: values.provider!, root: resolve(values.root || join(homedir(), `.${values.provider}`)), query: values.query,
    project: values.project ? resolve(values.project) : undefined, session: values.session, since, messages: !!values.messages,
    limit: count(values.limit!,1,100,'--limit'), maxFiles: count(values['max-files']!,1,10000,'--max-files'), maxBytes: count(values['max-bytes']!,1024,100*1024*1024,'--max-bytes') } satisfies Options;
}

function* files(root: string, depth = 0): Generator<string> {
  if (depth > 5 || !existsSync(root)) return;
  const dir = opendirSync(root);
  try {
    let entry;
    while ((entry = dir.readSync()) !== null) {
      if (entry.isSymbolicLink()) continue;
      const path = join(root, entry.name);
      if (entry.isDirectory()) yield* files(path, depth + 1);
      else if (entry.isFile() && entry.name.endsWith('.jsonl')) yield path;
    }
  } finally { dir.closeSync(); }
}

function contentText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.filter(item => item && typeof item === 'object' && ['text','input_text','output_text'].includes(item.type)).map(item => typeof item.text === 'string' ? item.text : '').join('\n');
}

function excerpt(text: string, words: string[]) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const position = Math.max(0,normalized.toLowerCase().indexOf(words[0]) - 120);
  return (position ? '…' : '') + normalized.slice(position,position + 650) + (normalized.length > position + 650 ? '…' : '');
}

export async function searchHistory(options: Options) {
  const indexMode = options.provider === 'claude' && !options.messages;
  const location = indexMode ? join(options.root,'history.jsonl') : join(options.root,options.provider === 'claude' ? 'projects' : 'sessions');
  if (!existsSync(location)) throw new Error(`History is unavailable at ${location}`);
  const words = options.query.toLowerCase().trim().split(/\s+/);
  const matches: Record<string, unknown>[] = [];
  const coverage = { filesScanned: 0, bytesScanned: 0, malformedLines: 0, oversizedLines: 0, bounded: false, order: 'File traversal order; not newest-first', mode: indexMode ? 'Claude prompt index' : options.messages ? 'Scoped user/assistant text' : 'Codex user prompts' };
  const candidates: Iterable<string> = indexMode ? [location] : files(location);
  outer: for (const file of candidates) {
    if (options.session && !indexMode && !file.includes(options.session)) continue;
    if (coverage.filesScanned >= options.maxFiles || coverage.bytesScanned >= options.maxBytes) { coverage.bounded = true; break; }
    coverage.filesScanned++;
    let sessionId: string | undefined;
    let project: string | undefined;
    const remaining = options.maxBytes - coverage.bytesScanned;
    const truncatedFile = statSync(file).size > remaining;
    const stream = createReadStream(file, { highWaterMark: 8192, start: 0, end: remaining - 1 });
    const lines = createInterface({ input: stream, crlfDelay: Infinity });
    let lineNo = 0;
    try {
      for await (const line of lines) {
        lineNo++;
        coverage.bytesScanned = Math.min(options.maxBytes,coverage.bytesScanned + Buffer.byteLength(line,'utf8') + 1);
        if (line.length > 1024*1024) { coverage.oversizedLines++; continue; }
        let row;
        try { row = JSON.parse(line); } catch { coverage.malformedLines++; continue; }
        if (!row || typeof row !== 'object') { coverage.malformedLines++; continue; }
        if (row.type === 'session_meta') { sessionId = row.payload?.id; project = row.payload?.cwd; }
        if (row.type === 'turn_context' && typeof row.payload?.cwd === 'string') project = row.payload.cwd;
        let role = '';
        let text = '';
        let timestamp = row.timestamp;
        if (indexMode) {
          text = typeof row.display === 'string' ? row.display : '';
          project = row.project; sessionId = row.sessionId; role = 'user';
        } else if (options.provider === 'claude' && ['user','assistant'].includes(row.type)) {
          role = row.message?.role ?? row.type;
          text = contentText(row.message?.content);
          project = row.cwd ?? project; sessionId = row.sessionId ?? sessionId;
        } else if (options.provider === 'codex') {
          if (row.type !== 'response_item' || row.payload?.type !== 'message') continue;
          role = row.payload.role;
          if (!['user','assistant'].includes(role) || row.payload.channel === 'analysis') continue;
          text = contentText(row.payload.content);
        }
        if (!options.messages && role !== 'user') continue;
        if (options.project && (typeof project !== 'string' || resolve(project) !== options.project)) continue;
        if (options.session && sessionId !== options.session) continue;
        const ms = typeof timestamp === 'number' ? timestamp : Date.parse(timestamp);
        if (options.since !== undefined && (!Number.isFinite(ms) || ms < options.since)) continue;
        if (!text || !words.every(word => text.toLowerCase().includes(word))) continue;
        matches.push({ file, line: lineNo, sessionId, project, timestamp, role, excerpt: excerpt(text,words) });
        if (matches.length >= options.limit) { coverage.bounded = true; break outer; }
      }
    } finally { lines.close(); stream.destroy(); }
    if (truncatedFile) { coverage.bounded = true; break; }
  }
  return { provider: options.provider, query: options.query, coverage, matches };
}

async function main() {
  try {
    const options = historyOptions(process.argv.slice(2));
    if (!options) { console.log('Usage: node search-history.ts --query WORDS [--provider claude|codex] [--root DIR] [--project DIR] [--session ID] [--messages] [--since ISO] [--limit 1-100] [--max-files 1-10000] [--max-bytes 1024-104857600]\nAll query words match literally, case-insensitively. Defaults to user prompts. Full text mode needs --session. Outputs short excerpts, never tool results or reasoning. Results are bounded and not newest-first.'); return; }
    console.log(JSON.stringify(await searchHistory(options),null,2));
  } catch (error) { console.error((error as Error).message); process.exitCode = 1; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) await main();
