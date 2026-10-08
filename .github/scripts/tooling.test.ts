import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateFrontmatter, validateSkills } from './validate-skills.ts';
import { githubCommands } from '../../gather-context/scripts/github-evidence.ts';
import { renderBrief } from '../../plan-artifact/scripts/render-brief.ts';
import { historyOptions, searchHistory } from '../../session-history/scripts/search-history.ts';

test('skill validation accepts structured metadata and rejects malformed YAML', () => {
  assert.deepEqual(validateFrontmatter('---\nname: demo\ndescription: Example\nmetadata:\n  short-description: Example\n---\nBody', 'demo'), []);
  assert.ok(validateFrontmatter('---\nname: demo\ndescription: [broken\n---\nBody', 'demo').length);
  assert.ok(validateFrontmatter('---\nname: wrong\ndescription: Example\n---\nBody', 'demo').length);
  assert.ok(validateFrontmatter('---\nname: demo\ndescription: [one, two]\n---\nBody', 'demo').length);
});

test('packaging validation finds broken local links but ignores example code', t => {
  const root = mkdtempSync(join(tmpdir(), 'skill-packaging-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'demo'));
  writeFileSync(join(root, 'demo/SKILL.md'), '---\nname: demo\ndescription: Example\n---\n[Missing](missing.md)\n```md\n[Example](placeholder.md)\n```');
  const result = validateSkills(root);
  assert.equal(result.count, 1);
  assert.deepEqual(result.errors, ['demo/SKILL.md: missing local link missing.md']);
  writeFileSync(join(root, 'demo/missing.md'), 'Reference');
  assert.deepEqual(validateSkills(root).errors, []);
});

test('GitHub evidence commands keep caller values out of shell syntax', () => {
  const request = githubCommands(['--repo', 'owner/repo', '--pr', '12', '--limit', '5', '--dry-run']);
  assert.equal(request.commands[0].args[0], 'pr');
  assert.equal(request.commands[1].args[2], 'GET');
  assert.equal(request.commands[1].args[3], 'repos/owner/repo/issues/12/comments?per_page=5&page=1');
  for (const args of [['--repo', 'owner/repo;echo bad', '--pr', '12'], ['--repo', 'owner/repo', '--pr', '12;echo bad']]) {
    assert.throws(() => githubCommands(args));
  }
});

test('brief renderer escapes source text and refuses unsafe source URLs', () => {
  const brief = {
    title: 'Synthetic <script>marker</script>', question: 'Question', summary: 'Summary', scope: 'Synthetic',
    sections: [{ id: 'example', title: 'Example', paragraphs: ['<img src=x onerror=marker()>'], evidence: ['S1'] }],
    sources: [{ id: 'S1', label: 'Fixture', locator: 'fixture.ts', retrievedAt: '2026-10-07', origin: 'synthetic' }],
  };
  const html = renderBrief(brief);
  assert.ok(html.includes('&lt;img src=x onerror=marker()&gt;'));
  assert.ok(!html.includes('<script>marker</script>'));
  assert.throws(() => renderBrief({ ...brief, sources: [{ ...brief.sources[0], url: 'javascript:marker()' }] }));
  assert.throws(() => renderBrief({ ...brief, sections: [{ ...brief.sections[0], evidence: ['missing'] }] }));
});

test('history search excludes tools and hidden reasoning from scoped messages', async t => {
  const root = mkdtempSync(join(tmpdir(), 'skill-history-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'sessions'));
  const rows = [
    { type: 'session_meta', payload: { id: 'synthetic-session', cwd: root } },
    { type: 'response_item', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'synthetic decision' }] } },
    { type: 'response_item', payload: { type: 'message', role: 'assistant', channel: 'analysis', content: [{ type: 'output_text', text: 'synthetic hidden' }] } },
    { type: 'response_item', payload: { type: 'function_call_output', output: 'synthetic raw tool output' } },
    { type: 'response_item', payload: { type: 'message', role: 'assistant', channel: 'final', content: [{ type: 'output_text', text: 'synthetic accepted decision' }] } },
  ];
  writeFileSync(join(root, 'sessions/rollout-synthetic-session.jsonl'), rows.map(row => JSON.stringify(row)).join('\n'));
  const options = historyOptions(['--provider', 'codex', '--root', root, '--session', 'synthetic-session', '--query', 'synthetic', '--messages'])!;
  const result = await searchHistory(options);
  assert.deepEqual(result.matches.map(row => row.role), ['user', 'assistant']);
  assert.ok(result.matches.every(row => !String(row.excerpt).includes('hidden') && !String(row.excerpt).includes('tool output')));
  assert.throws(() => historyOptions(['--query', 'synthetic', '--messages']));
});
