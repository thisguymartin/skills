import { readFileSync, writeFileSync, mkdirSync, realpathSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

type Evidence = { evidence?: string[] };
type Section = Evidence & { id: string; title: string; paragraphs: string[]; details?: string[] };
type Source = { id: string; label: string; locator: string; retrievedAt: string; origin: string; url?: string; note?: string };
type Flow = { title: string; state: 'current'|'proposed'|'unknown'; nodes: (Evidence & {id: string; label: string; detail: string})[]; edges: (Evidence & {from: string; to: string; label: string})[] };
type Option = Evidence & { name: string; benefit: string; tradeoff: string; confidence: string };
type Step = { title: string; outcome: string; dependsOn: string; check: string };
export type Brief = { title: string; question: string; summary: string; scope: string; audience?: string; updatedAt?: string; sections: Section[]; sources: Source[]; flows?: Flow[]; options?: Option[]; plan?: Step[]; questions?: string[] };

function record(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
}
function text(value: unknown, label: string, max = 12000): asserts value is string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${label} must be a nonempty string of at most ${max} characters`);
}
function list(value: unknown, label: string, max = 100): asserts value is unknown[] {
  if (!Array.isArray(value) || value.length > max) throw new Error(`${label} must be an array of at most ${max} items`);
}
function id(value: unknown, label: string): asserts value is string {
  text(value,label,64);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value)) throw new Error(`${label} must be a safe identifier`);
}

export function validateBrief(value: unknown): asserts value is Brief {
  record(value,'brief');
  for (const key of ['title','question','summary','scope']) text(value[key],key);
  for (const key of ['audience','updatedAt']) if (value[key] !== undefined) text(value[key],key);
  list(value.sources,'sources');
  const sourceIds = new Set<string>();
  for (const source of value.sources) {
    record(source,'source'); id(source.id,'source.id');
    if (sourceIds.has(source.id)) throw new Error(`Duplicate source ${source.id}`);
    sourceIds.add(source.id);
    for (const key of ['label','locator','retrievedAt','origin']) text(source[key],`source.${key}`);
    if (source.note !== undefined) text(source.note,'source.note');
    if (source.url !== undefined) {
      text(source.url,'source.url');
      let url: URL;
      try { url = new URL(source.url); } catch { throw new Error('source.url must be an absolute HTTP(S) URL'); }
      if (!['https:','http:'].includes(url.protocol) || url.username || url.password) throw new Error('source.url must be an HTTP(S) URL without credentials');
    }
  }
  const evidence = (item: Record<string,unknown>) => {
    if (item.evidence === undefined) return;
    list(item.evidence,'evidence');
    for (const ref of item.evidence) if (typeof ref !== 'string' || !sourceIds.has(ref)) throw new Error(`Unknown evidence ID ${ref}`);
  };
  const strings = (items: unknown, name: string, required = false) => {
    list(items,name);
    if (required && !items.length) throw new Error(`${name} cannot be empty`);
    for (const item of items) text(item,name);
  };
  list(value.sections,'sections');
  if (!value.sections.length) throw new Error('sections cannot be empty');
  const sectionIds = new Set<string>();
  for (const section of value.sections) {
    record(section,'section'); id(section.id,'section.id');
    if (sectionIds.has(section.id)) throw new Error(`Duplicate section ${section.id}`);
    sectionIds.add(section.id);
    text(section.title,'section.title'); strings(section.paragraphs,'paragraphs',true); evidence(section);
    if (section.details !== undefined) strings(section.details,'details');
  }
  if (value.flows !== undefined) {
    list(value.flows,'flows',12);
    for (const flow of value.flows) {
      record(flow,'flow'); text(flow.title,'flow.title');
      if (!['current','proposed','unknown'].includes(String(flow.state))) throw new Error('Flow state must be current, proposed, or unknown');
      list(flow.nodes,'flow.nodes',8); list(flow.edges,'flow.edges',20);
      if (!flow.nodes.length) throw new Error('Flow needs nodes');
      const nodeIds = new Set<string>();
      for (const node of flow.nodes) {
        record(node,'node'); id(node.id,'node.id'); text(node.label,'node.label',70); text(node.detail,'node.detail',180); evidence(node);
        if (nodeIds.has(node.id)) throw new Error(`Duplicate flow node ${node.id}`);
        nodeIds.add(node.id);
      }
      for (const edge of flow.edges) {
        record(edge,'edge'); text(edge.label,'edge.label',80); evidence(edge);
        if (!nodeIds.has(String(edge.from)) || !nodeIds.has(String(edge.to)) || edge.from === edge.to) throw new Error('Flow edge must connect two distinct existing nodes');
      }
    }
  }
  for (const [key,fields] of [['options',['name','benefit','tradeoff','confidence']],['plan',['title','outcome','dependsOn','check']]] as const) {
    if (value[key] === undefined) continue;
    list(value[key],key);
    for (const item of value[key]) { record(item,key); for (const field of fields) text(item[field],`${key}.${field}`); evidence(item); }
  }
  if (value.questions !== undefined) strings(value.questions,'questions');
}

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const refs = (value: Evidence) => (value.evidence ?? []).map(ref => `<a class="citation" href="#source-${escape(ref)}" aria-label="Source ${escape(ref)}">${escape(ref)}</a>`).join(' ');

function wrap(value: string, width: number, maxLines: number) {
  const words = value.split(/\s+/).flatMap(word => word.match(new RegExp(`.{1,${width}}`,'gu')) || []);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (line && line.length + word.length + 1 > width) { lines.push(line); line = word; }
    else line += `${line ? ' ' : ''}${word}`;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines-1] = lines[maxLines-1].slice(0,width-1) + '…'; }
  return lines;
}

function diagram(flow: Flow, index: number) {
  const height = flow.nodes.length * 180 + 35;
  const positions = new Map(flow.nodes.map((node,i) => [node.id,{ x: 100, y: 25 + i*180 }]));
  const edgeWidth = 620 + flow.edges.length*22;
  const edges = flow.edges.map((edge,i) => {
    const start = positions.get(edge.from)!;
    const end = positions.get(edge.to)!;
    const adjacent = end.y === start.y + 180;
    const lane = 525 + i*22;
    const path = adjacent ? `M 290 ${start.y+130} L 290 ${end.y-6}` : `M 480 ${start.y+65} H ${lane} V ${end.y+65} H 486`;
    const labelX = adjacent ? 308 : lane+8;
    const labelY = adjacent ? start.y+153 : (start.y+end.y)/2+65;
    return `<g><title>${escape(`${edge.from} -> ${edge.to}: ${edge.label}`)}</title><path d="${path}" fill="none" stroke="#53716c" stroke-width="2" marker-end="url(#arrow-${index})"/><text x="${labelX}" y="${labelY}" font-size="12">${wrap(edge.label,25,2).map((line,j)=>`<tspan x="${labelX}" dy="${j ? 15 : 0}">${escape(line)}</tspan>`).join('')}</text></g>`;
  }).join('');
  const nodes = flow.nodes.map((node,i) => {
    const {x,y} = positions.get(node.id)!;
    const label = wrap(node.label,32,2);
    const detail = wrap(node.detail,45,3);
    return `<g><title>${escape(`${node.label}: ${node.detail}`)}</title><rect x="${x}" y="${y}" width="380" height="130" rx="9" fill="#fffdf7" stroke="#809c97"/><text x="${x+16}" y="${y+22}" font-size="11" fill="#63726f">${String(i+1).padStart(2,'0')}</text><text x="${x+16}" y="${y+45}" font-size="17" font-weight="650">${label.map((line,j)=>`<tspan x="${x+16}" dy="${j ? 20 : 0}">${escape(line)}</tspan>`).join('')}</text><text x="${x+16}" y="${y+75 + (label.length-1)*20}" font-size="12" fill="#586661">${detail.map((line,j)=>`<tspan x="${x+16}" dy="${j ? 15 : 0}">${escape(line)}</tspan>`).join('')}</text></g>`;
  }).join('');
  const equivalent = `<details class="flow-text"><summary>Text equivalent and flow evidence</summary><ol>${flow.nodes.map(n=>`<li><strong>${escape(n.label)}</strong>: ${escape(n.detail)} ${refs(n)}</li>`).join('')}</ol><ul>${flow.edges.map(e=>`<li>${escape(flow.nodes.find(n=>n.id===e.from)!.label)} → ${escape(flow.nodes.find(n=>n.id===e.to)!.label)}: ${escape(e.label)} ${refs(e)}</li>`).join('')}</ul></details>`;
  return `<article class="flow"><div class="flow-heading"><h3>${escape(flow.title)}</h3><span class="badge ${flow.state}">${flow.state}</span></div><div class="diagram"><svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="flow-title-${index}" viewBox="0 0 ${edgeWidth} ${height}"><title id="flow-title-${index}">${escape(flow.title)} (${flow.state}); full text follows</title><defs><marker id="arrow-${index}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#53716c"/></marker></defs>${edges}${nodes}</svg></div>${equivalent}</article>`;
}

const css = `
:root{--paper:#f5f2ea;--ink:#21332e;--muted:#626d67;--line:#d9ded3;--accent:#a64626}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.65 system-ui,-apple-system,sans-serif}a{color:#21675d;text-underline-offset:3px}a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid #b95832;outline-offset:4px}.layout{max-width:1280px;margin:auto;display:grid;grid-template-columns:210px minmax(0,1fr);gap:45px;padding:40px}nav{position:sticky;top:30px;align-self:start;font-size:13px}nav .brand{font-weight:800;letter-spacing:.15em;font-size:11px;color:var(--accent);margin-bottom:22px}nav a{display:block;padding:7px 0;text-decoration:none;color:var(--muted)}nav a:hover{color:var(--accent)}main{min-width:0}.eyebrow{color:var(--accent);font-size:12px;font-weight:750;letter-spacing:.1em;text-transform:uppercase}h1{font:normal clamp(34px,5vw,55px)/1.1 Georgia,serif;margin:15px 0 22px;max-width:850px}h2{font:normal 30px/1.25 Georgia,serif;margin:0 0 20px}h3{font-size:18px;line-height:1.4;margin:0}p{margin:0 0 16px;white-space:pre-wrap;overflow-wrap:anywhere}.question{font-size:19px;max-width:750px}.answer{border-left:4px solid var(--accent);padding:22px 26px;background:#fffdf8;font-size:18px}.scope{font-size:13px;color:var(--muted);border-top:1px solid var(--line);padding-top:18px;overflow-wrap:anywhere}.meta{display:flex;gap:18px;flex-wrap:wrap;font-size:12px;color:var(--muted);margin:17px 0}section{padding:32px 0;border-top:1px solid var(--line);scroll-margin-top:22px}.section-index{font-size:11px;letter-spacing:.12em;color:var(--accent);margin:0 0 8px}.citation{display:inline-block;font-size:11px;font-weight:700;background:#e2ece5;padding:1px 6px;border-radius:3px;text-decoration:none;margin:0 2px}details{background:#eeeae0;padding:14px 18px;margin:18px 0}summary{cursor:pointer;font-weight:650}details p:first-of-type{margin-top:16px}.flow{border:1px solid var(--line);background:#faf8f1;padding:22px;margin:20px 0}.flow-heading{display:flex;justify-content:space-between;gap:16px;align-items:baseline}.badge{font-size:11px;text-transform:uppercase;letter-spacing:.1em;padding:3px 8px;border:1px solid #9bb2a5;white-space:nowrap}.proposed{border-color:#bda891;background:#f5eadb}.unknown{border-style:dashed;background:#edeae6}.diagram{overflow-x:auto;margin:12px 0}.diagram svg{display:block;width:100%;min-width:620px;max-height:1600px}svg text{font-family:system-ui,sans-serif;fill:var(--ink)}.flow-text{font-size:13px;background:transparent;border-top:1px solid var(--line);margin-bottom:0}.table-scroll{overflow:auto}table{width:100%;border-collapse:collapse;min-width:650px;text-align:left;font-size:14px}th,td{padding:15px;vertical-align:top;border-bottom:1px solid var(--line);overflow-wrap:anywhere}th{font-size:11px;text-transform:uppercase;color:var(--muted)}.steps{list-style:none;padding:0;counter-reset:step}.steps li{counter-increment:step;border:1px solid var(--line);padding:20px 24px;margin:12px 0;background:#fffdf7}.steps h3:before{content:counter(step,decimal-leading-zero)' / ';color:var(--accent);font-weight:450}.steps dl{margin-bottom:0}.steps dt{font-size:11px;text-transform:uppercase;color:var(--muted);font-weight:700}.steps dd{margin:0 0 10px}.source{padding:18px 0;border-bottom:1px solid var(--line);font-size:14px;overflow-wrap:anywhere}.source .meta{margin:5px 0}.source p{margin:4px 0}.toolbar{display:flex;gap:8px;margin:25px 0}button{border:1px solid #afbab0;background:transparent;color:var(--ink);padding:8px 12px;font:inherit;font-size:12px;cursor:pointer}footer{color:var(--muted);font-size:12px;padding:20px 0}li{margin-bottom:8px} .skip{position:absolute;top:-100px}.skip:focus{top:10px;left:10px;background:white;padding:8px}
@media(max-width:900px){.layout{display:block;padding:24px}nav{position:static;border-bottom:1px solid var(--line);padding-bottom:18px;margin-bottom:30px}nav a{display:inline-block;margin-right:14px}nav .brand{margin-bottom:8px}.flow{padding:12px}h1{font-size:36px}.answer{padding:18px}.flow-heading{align-items:start}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
@media print{body{background:white;font-size:11pt}.layout{display:block;padding:0;max-width:none}nav,.toolbar,.skip{display:none}h1{font-size:30pt}section{break-inside:auto}h2,h3,summary{break-after:avoid}.flow,.steps li,.source{break-inside:avoid}.diagram svg{min-width:0;max-height:none}details{background:white}details>summary{display:none}details>:not(summary){display:block!important}.diagram{overflow:visible}table{min-width:0}a{color:inherit}.answer{background:white}}
`;

export function renderBrief(value: unknown) {
  validateBrief(value);
  const brief = value;
  const extra = [brief.flows?.length ? ['flows','Flows'] : null, brief.options?.length ? ['options','Alternatives'] : null, brief.plan?.length ? ['plan','Plan'] : null, brief.questions?.length ? ['questions','Open questions'] : null, ['sources','Sources']].filter(Boolean) as string[][];
  const navigation = [...brief.sections.map(s=>[`section-${s.id}`,s.title]),...extra];
  const sections = brief.sections.map((s,i)=>`<section id="section-${escape(s.id)}"><div class="section-index">${String(i+1).padStart(2,'0')} / Research</div><h2>${escape(s.title)}</h2>${s.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}<div>${refs(s)}</div>${s.details?.length ? `<details><summary>Read the supporting detail</summary>${s.details.map(p=>`<p>${escape(p)}</p>`).join('')}</details>` : ''}</section>`).join('');
  const flows = brief.flows?.length ? `<section id="flows"><h2>Flows and boundaries</h2>${brief.flows.map(diagram).join('')}</section>` : '';
  const options = brief.options?.length ? `<section id="options"><h2>Alternatives</h2><div class="table-scroll"><table><thead><tr><th>Option</th><th>Benefit</th><th>Tradeoff</th><th>Confidence and evidence</th></tr></thead><tbody>${brief.options.map(o=>`<tr><td><strong>${escape(o.name)}</strong></td><td>${escape(o.benefit)}</td><td>${escape(o.tradeoff)}</td><td>${escape(o.confidence)} ${refs(o)}</td></tr>`).join('')}</tbody></table></div></section>` : '';
  const plan = brief.plan?.length ? `<section id="plan"><h2>Plan and completion checks</h2><ol class="steps">${brief.plan.map(s=>`<li><h3>${escape(s.title)}</h3><dl><dt>Outcome</dt><dd>${escape(s.outcome)}</dd><dt>Depends on</dt><dd>${escape(s.dependsOn)}</dd><dt>Complete when</dt><dd>${escape(s.check)}</dd></dl></li>`).join('')}</ol></section>` : '';
  const questions = brief.questions?.length ? `<section id="questions"><h2>Open questions</h2><ul>${brief.questions.map(q=>`<li>${escape(q)}</li>`).join('')}</ul></section>` : '';
  const sources = `<section id="sources"><h2>Sources and coverage</h2>${brief.sources.length ? brief.sources.map(s=>`<article class="source" id="source-${escape(s.id)}"><strong>${escape(s.id)} · ${escape(s.label)}</strong><div class="meta"><span>${escape(s.origin)}</span><span>Retrieved ${escape(s.retrievedAt)}</span></div><p>${s.url ? `<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.locator)}</a>` : escape(s.locator)}</p>${s.note ? `<p>${escape(s.note)}</p>` : ''}</article>`).join('') : '<p>No sources supplied. This artifact is an unsourced draft.</p>'}</section>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${escape(brief.title)}</title><style>${css}</style></head><body><a class="skip" href="#brief">Skip to brief</a><div class="layout"><nav aria-label="Brief sections"><div class="brand">Research / Plan</div><a href="#brief">The answer</a>${navigation.map(([id,label])=>`<a href="#${escape(id)}">${escape(label)}</a>`).join('')}</nav><main id="brief"><header><div class="eyebrow">${escape(brief.audience || 'Research brief')}</div><h1>${escape(brief.title)}</h1><p class="question">${escape(brief.question)}</p><div class="answer"><p>${escape(brief.summary)}</p></div><div class="meta">${brief.updatedAt ? `<span>Updated ${escape(brief.updatedAt)}</span>` : ''}<span>Evidence -> explanation -> plan</span></div><p class="scope">${escape(brief.scope)}</p></header><div class="toolbar"><button id="detail-toggle" type="button">Expand all details</button><button id="print" type="button">Print / save PDF</button></div>${sections}${flows}${options}${plan}${questions}${sources}<footer>Standalone brief · Evidence and verification limits are recorded above.</footer></main></div><script>
const toggle=document.getElementById('detail-toggle');toggle.addEventListener('click',()=>{const expand=toggle.textContent.startsWith('Expand');document.querySelectorAll('details').forEach(d=>d.open=expand);toggle.textContent=expand?'Collapse all details':'Expand all details';});document.getElementById('print').addEventListener('click',()=>window.print());let beforePrint=[];window.addEventListener('beforeprint',()=>{beforePrint=[...document.querySelectorAll('details')].map(d=>d.open);document.querySelectorAll('details').forEach(d=>d.open=true);});window.addEventListener('afterprint',()=>{document.querySelectorAll('details').forEach((d,i)=>d.open=beforePrint[i]);});
</script></body></html>`;
}

function main() {
  try {
    const { values } = parseArgs({ options: { input: {type:'string'}, output: {type:'string'}, help: {type:'boolean'} } });
    if (values.help) { console.log('Usage: node render-brief.ts --input brief.json --output brief.html\nCreates a new offline HTML file. Refuses to overwrite existing output.'); return; }
    if (!values.input || !values.output) throw new Error('--input and --output are required');
    const html = renderBrief(JSON.parse(readFileSync(values.input,'utf8')));
    mkdirSync(dirname(values.output),{recursive:true});
    writeFileSync(values.output,html,{flag:'wx',mode:0o600});
    console.log(values.output);
  } catch (error) { console.error((error as Error).message); process.exitCode = 1; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) main();
