import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { renderBrief, validateBrief } from '../../plan-artifact/scripts/render-brief.ts';
import { githubCommands } from '../../gather-context/scripts/github-evidence.ts';
import { historyOptions, searchHistory } from '../../session-history/scripts/search-history.ts';

const root = resolve(import.meta.dirname,'../..');
const sample = () => JSON.parse(readFileSync(join(root,'docs/examples/research-brief.json'),'utf8'));

function fixture(t: { after: (fn: () => void) => void }) {
  const dir = mkdtempSync(join(tmpdir(),'thisguyskills-runtime-'));
  t.after(()=>rmSync(dir,{recursive:true,force:true}));
  return dir;
}
function put(dir: string, path: string, rows: unknown[]) {
  const target = join(dir,path); mkdirSync(resolve(target,'..'),{recursive:true});
  writeFileSync(target,rows.map(row=>JSON.stringify(row)).join('\n')+'\n');
}

test('renderer escapes untrusted source content and rejects executable URLs',()=>{
  const brief = sample();
  brief.sections[0].paragraphs.push('<img src=x onerror=alert(1)> & "test"');
  const html = renderBrief(brief);
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('<svg'));
  assert.ok(html.includes('href="#source-S1"'));
  assert.ok(!/src="https?:/.test(html));
  for (const url of ['javascript:alert(1)','data:text/html,test','https://secret:password@example.com']) {
    brief.sources[0].url = url;
    assert.throws(()=>validateBrief(brief),/HTTP\(S\)/);
  }
});

test('renderer rejects dangling evidence and misleading diagram connections',()=>{
  const brief = sample();
  brief.sections[0].evidence = ['missing'];
  assert.throws(()=>renderBrief(brief),/Unknown evidence/);
  brief.sections[0].evidence = ['S1'];
  brief.flows[0].edges[0].to = 'not-a-node';
  assert.throws(()=>renderBrief(brief),/distinct existing nodes/);
  brief.flows[0].edges[0].to = brief.flows[0].nodes[0].id;
  assert.throws(()=>renderBrief(brief),/distinct existing nodes/);
});

test('renderer CLI creates offline HTML and preserves existing output',t=>{
  const dir = fixture(t); const output = join(dir,'brief.html');
  const args = [join(root,'plan-artifact/scripts/render-brief.ts'),'--input',join(root,'docs/examples/research-brief.json'),'--output',output];
  execFileSync(process.execPath,args);
  const before = readFileSync(output,'utf8');
  assert.throws(()=>execFileSync(process.execPath,args,{stdio:'pipe'}),/Command failed/);
  assert.equal(readFileSync(output,'utf8'),before);
});

test('GitHub commands are scoped GETs with explicit coverage limits',()=>{
  const request = githubCommands(['--repo','example/synthetic','--pr','42','--limit','7']);
  assert.equal(request.commands.length,5);
  for (const command of request.commands.slice(1)) {
    assert.equal(command.args[2],'GET');
    assert.ok(command.args[3].startsWith('repos/example/synthetic/'));
    assert.ok(command.args[3].endsWith('?per_page=7&page=1'));
  }
  for (const args of [ ['--repo','--bad/synthetic','--pr','1'],['--repo','example/synthetic','--pr','1','--issue','2'],['--repo','example/synthetic','--pr','1;echo bad'],['--repo','example/synthetic','--pr','1','--limit','101'] ]) assert.throws(()=>githubCommands(args));
});

test('GitHub CLI dry-run never requires or invokes gh',()=>{
  const args = [join(root,'gather-context/scripts/github-evidence.ts'),'--repo','example/synthetic','--pr','42','--dry-run'];
  const result = JSON.parse(execFileSync(process.execPath,args,{encoding:'utf8',env:{...process.env,PATH:'/nonexistent'}}));
  assert.equal(result.dryRun,true);
  assert.ok(result.commands.length > 0);
});

test('helpers run through symlinked skill installations',t=>{
  const dir = fixture(t);
  for (const name of ['gather-context','session-history','plan-artifact']) {
    symlinkSync(join(root,name),join(dir,name),'dir');
    const script = { 'gather-context':'github-evidence.ts', 'session-history':'search-history.ts', 'plan-artifact':'render-brief.ts' }[name]!;
    const output = execFileSync(process.execPath,[join(dir,name,'scripts',script),'--help'],{encoding:'utf8'});
    assert.ok(output.startsWith('Usage:'));
  }
});

test('Claude index search filters scope and omits pasted content/tool data',async t=>{
  const dir = fixture(t);
  put(dir,'history.jsonl',[
    {display:'Research artifact old',project:'/synthetic/other',sessionId:'one',timestamp:1},
    {display:'Research artifact plan',project:'/synthetic/repo',sessionId:'two',timestamp:2000,pastedContents:{private:'not-to-export'}},
  ]);
  const result = await searchHistory(historyOptions(['--root',dir,'--query','research artifact','--project','/synthetic/repo'])!);
  assert.equal(result.matches.length,1);
  assert.equal(result.matches[0].sessionId,'two');
  assert.ok(!JSON.stringify(result).includes('not-to-export'));
  assert.throws(()=>historyOptions(['--query','test','--messages']),/session/);
});

test('Claude scoped transcript excludes tool results and thinking blocks',async t=>{
  const dir = fixture(t);
  put(dir,'projects/synthetic/session-one.jsonl',[
    {type:'user',sessionId:'session-one',cwd:'/synthetic/repo',message:{role:'user',content:[{type:'tool_result',content:'research artifact secret-tool'},{type:'text',text:'Research artifact request'}]}},
    {type:'assistant',sessionId:'session-one',message:{role:'assistant',content:[{type:'thinking',thinking:'research artifact hidden'},{type:'text',text:'Research artifact answer'}]}},
  ]);
  const result = await searchHistory(historyOptions(['--root',dir,'--query','research artifact','--session','session-one','--messages'])!);
  assert.equal(result.matches.length,2);
  assert.ok(!JSON.stringify(result).includes('secret-tool'));
  assert.ok(!JSON.stringify(result).includes('hidden'));
});

test('Codex history excludes analysis and tools while preserving session provenance',async t=>{
  const dir = fixture(t);
  put(dir,'sessions/2026/10/06/rollout-session-one.jsonl',[
    {type:'session_meta',payload:{id:'session-one',cwd:'/synthetic/repo'}},
    {type:'response_item',payload:{type:'message',role:'assistant',channel:'analysis',content:[{type:'output_text',text:'retry plan hidden'}]}},
    {type:'response_item',payload:{type:'function_call_output',output:'retry plan secret-tool'}},
    {type:'response_item',payload:{type:'message',role:'user',content:[{type:'input_text',text:'Explain the retry plan'}]}},
    {type:'response_item',payload:{type:'message',role:'assistant',channel:'final',content:[{type:'output_text',text:'Here is the retry plan'}]}},
  ]);
  const result = await searchHistory(historyOptions(['--provider','codex','--root',dir,'--query','retry plan','--project','/synthetic/repo'])!);
  assert.equal(result.matches.length,1);
  assert.equal(result.matches[0].role,'user');
  assert.equal(result.matches[0].sessionId,'session-one');
  const messages = await searchHistory(historyOptions(['--provider','codex','--root',dir,'--query','retry plan','--session','session-one','--messages'])!);
  assert.equal(messages.matches.length,2);
  assert.ok(!JSON.stringify(messages).includes('secret-tool'));
  assert.ok(!JSON.stringify(messages).includes('hidden'));
});

test('history distinguishes missing input, malformed lines and bounded coverage',async t=>{
  const dir = fixture(t);
  await assert.rejects(()=>searchHistory(historyOptions(['--root',dir,'--query','test'])!),/unavailable/);
  writeFileSync(join(dir,'history.jsonl'),'not json\n'+JSON.stringify({display:'test example',sessionId:'one'})+'\n'+JSON.stringify({display:'test example',sessionId:'two'})+'\n');
  const result = await searchHistory(historyOptions(['--root',dir,'--query','test','--limit','1'])!);
  assert.equal(result.coverage.malformedLines,1);
  assert.equal(result.matches.length,1);
  assert.equal(result.coverage.bounded,true);
});

test('history byte bound stops before later archive contents',async t=>{
  const dir = fixture(t);
  put(dir,'history.jsonl',[
    {display:'unrelated '+ 'x'.repeat(2000),sessionId:'one'},
    {display:'find-later-secret',sessionId:'two'},
  ]);
  const result = await searchHistory(historyOptions(['--root',dir,'--query','find-later-secret','--max-bytes','1024'])!);
  assert.equal(result.matches.length,0);
  assert.equal(result.coverage.bounded,true);
  assert.ok(result.coverage.bytesScanned <= 1024);
});
