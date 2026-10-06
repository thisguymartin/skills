#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

type State = 'current' | 'built' | 'new' | 'fail' | 'rule';
type Side = 'l' | 'r' | 't' | 'b';
type Box = { x: number; y: number; w: number; h: number };
type DiagramNode = Box & { id: string; title: string; lines?: string[]; state: State };
type Zone = Box & { label: string };
type Note = { x: number; y: number; text: string; state: State };
type Edge = {
  from: string;
  to: string;
  label: string;
  state: State;
  fromSide?: Side;
  toSide?: Side;
  fromOffset?: number;
  toOffset?: number;
  labelDx?: number;
  labelDy?: number;
};
type Diagram = { id: string; title: string; W: number; H: number; nodes: DiagramNode[]; edges: Edge[]; zones?: Zone[]; notes?: Note[] };
type Element = Record<string, unknown>;

const HELP = `Usage: node diagrams.ts --spec diagrams.json --out ./diagrams [options]

Renders every diagram in the spec to:
  <out>/<id>.svg          inline SVG fragment for the page (uses the CSS in diagram-format.md)
  <out>/<id>.excalidraw   scene file for excalidraw.com or the local canvas
  <out>/scenes.json       clipboard scenes for the page's Copy to Excalidraw buttons
  <out>/index.json        titles and edges, for the page's text equivalents

Options:
  --canvas <url>   canvas to push to (default: EXPRESS_SERVER_URL, then excalidraw-inbox --url, then http://127.0.0.1:3000)
  --no-canvas      skip the canvas
  --replace        clear the canvas before pushing (default appends below existing content)
  --help           show this help`;

const STYLE: Record<State | 'zone', { stroke: string; bg: string; svg: string; fill: string; dash: 'solid' | 'dashed' | 'dotted' }> = {
  current: { stroke: '#1e1e1e', bg: '#ffffff', svg: 'var(--d-ink)', fill: 'var(--d-fill)', dash: 'solid' },
  built: { stroke: '#1971c2', bg: '#d0ebff', svg: 'var(--d-built)', fill: 'var(--d-built-fill)', dash: 'solid' },
  new: { stroke: '#e8590c', bg: '#fff4e6', svg: 'var(--d-new)', fill: 'var(--d-new-fill)', dash: 'dashed' },
  fail: { stroke: '#c92a2a', bg: '#fff5f5', svg: 'var(--d-warn)', fill: 'var(--d-warn-fill)', dash: 'dotted' },
  rule: { stroke: '#868e96', bg: 'transparent', svg: 'var(--d-muted)', fill: 'none', dash: 'dotted' },
  zone: { stroke: '#868e96', bg: 'transparent', svg: 'var(--d-muted)', fill: 'none', dash: 'dashed' },
};
const STATES = new Set<string>(['current', 'built', 'new', 'fail', 'rule']);
const SIDES = new Set<string>(['l', 'r', 't', 'b']);

const SVG_CHAR_EM = 0.48;
const EXCALIDRAW_CHAR_EM = 0.62;
const FIT_SVG_EM = 0.44;
const FIT_EXCALIDRAW_EM = 0.58;
const EXCALIDRAW_SCALE = 1.15;
const EXCALIDRAW_FONT = 14;
const SVG_TITLE = 20;
const SVG_LINE = 15.5;
const GAP = 6;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const round = (n: number) => Math.round(n * 10) / 10;
const longest = (text: string) => Math.max(...text.split('\n').map((line) => line.length));

const validate = (diagrams: Diagram[]) => {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const d of diagrams) {
    if (!d.id || !/^[a-z0-9-]+$/.test(d.id)) errors.push(`diagram id "${d.id}" must be lowercase letters, digits and dashes`);
    if (ids.has(d.id)) errors.push(`diagram id "${d.id}" is used twice`);
    ids.add(d.id);
    if (!d.title || !(d.W > 0) || !(d.H > 0)) errors.push(`${d.id}: needs title, W and H`);
    const nodeIds = new Set<string>();
    for (const n of d.nodes ?? []) {
      if (nodeIds.has(n.id)) errors.push(`${d.id}: node "${n.id}" is used twice`);
      nodeIds.add(n.id);
      if (!STATES.has(n.state)) errors.push(`${d.id}/${n.id}: state must be one of ${[...STATES].join(', ')}`);
      if (!n.title || !(n.w > 0) || !(n.h > 0)) errors.push(`${d.id}/${n.id}: needs title, w and h`);
    }
    if (!d.nodes?.length) errors.push(`${d.id}: has no nodes`);
    for (const e of d.edges ?? []) {
      const where = `${d.id}: edge ${e.from} -> ${e.to}`;
      if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) errors.push(`${where} points at a missing node`);
      if (!e.label?.trim()) errors.push(`${where} needs a label`);
      if (!STATES.has(e.state)) errors.push(`${where}: state must be one of ${[...STATES].join(', ')}`);
      for (const side of [e.fromSide, e.toSide]) if (side && !SIDES.has(side)) errors.push(`${where}: side must be l, r, t or b`);
    }
    for (const note of d.notes ?? []) if (!STATES.has(note.state)) errors.push(`${d.id}: note "${note.text}" has an unknown state`);
  }
  return errors;
};

const fitWarnings = (d: Diagram) => {
  const warnings: string[] = [];
  for (const n of d.nodes) {
    const titleW = n.title.length * SVG_TITLE * FIT_SVG_EM;
    const lineW = Math.max(0, ...(n.lines ?? []).map((l) => l.length * SVG_LINE * FIT_SVG_EM));
    const canvasW = longest([n.title, ...(n.lines ?? [])].join('\n')) * EXCALIDRAW_FONT * FIT_EXCALIDRAW_EM;
    if (Math.max(titleW, lineW) > n.w - 8) warnings.push(`${d.id}/${n.id}: text is wider than the box on the page; widen to ~${Math.ceil(Math.max(titleW, lineW) + 20)}`);
    else if (canvasW > n.w * EXCALIDRAW_SCALE - 8) warnings.push(`${d.id}/${n.id}: text is wider than the box on the canvas; widen to ~${Math.ceil((canvasW + 16) / EXCALIDRAW_SCALE)}`);
    const textH = 24 + (n.lines?.length ?? 0) * 19;
    if (textH > n.h - 8) warnings.push(`${d.id}/${n.id}: ${n.lines?.length ?? 0} lines need about ${textH + 12} of height`);
  }
  for (const e of d.edges) {
    const { x1, y1, x2, y2 } = edgePoints(d, e);
    const labelW = longest(e.label) * SVG_LINE * FIT_SVG_EM + 12;
    const span = Math.hypot(x2 - x1, y2 - y1);
    if (labelW > span + 16 && !e.labelDx && !e.labelDy) warnings.push(`${d.id}: label "${e.label.replace(/\n/g, ' ')}" is longer than its arrow; break it with \\n or move it with labelDx/labelDy`);
  }
  return warnings;
};

const center = (n: Box) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });

const anchor = (n: Box, side: Side, offset = 0) => {
  if (side === 'r') return { x: n.x + n.w, y: n.y + n.h / 2 + offset };
  if (side === 'l') return { x: n.x, y: n.y + n.h / 2 + offset };
  if (side === 't') return { x: n.x + n.w / 2 + offset, y: n.y };
  return { x: n.x + n.w / 2 + offset, y: n.y + n.h };
};

const autoSides = (a: Box, b: Box): [Side, Side] => {
  const dx = center(b).x - center(a).x;
  const dy = center(b).y - center(a).y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? ['r', 'l'] : ['l', 'r'];
  return dy > 0 ? ['b', 't'] : ['t', 'b'];
};

const nodeOf = (d: Diagram, id: string) => d.nodes.find((n) => n.id === id) as DiagramNode;

function edgePoints(d: Diagram, e: Edge) {
  const a = nodeOf(d, e.from);
  const b = nodeOf(d, e.to);
  const [fromSide, toSide] = autoSides(a, b);
  const p1 = anchor(a, e.fromSide ?? fromSide, e.fromOffset ?? 0);
  const p2 = anchor(b, e.toSide ?? toSide, e.toOffset ?? 0);
  const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
  const ux = (p2.x - p1.x) / len;
  const uy = (p2.y - p1.y) / len;
  return { x1: p1.x + ux * GAP, y1: p1.y + uy * GAP, x2: p2.x - ux * GAP, y2: p2.y - uy * GAP };
}

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const jitter = (rand: () => number, amount: number) => (rand() * 2 - 1) * amount;

const roughSegment = (rand: () => number, x1: number, y1: number, x2: number, y2: number, amp: number, endJitter: number) => {
  const ax = x1 + jitter(rand, endJitter);
  const ay = y1 + jitter(rand, endJitter);
  const bx = x2 + jitter(rand, endJitter);
  const by = y2 + jitter(rand, endJitter);
  const len = Math.hypot(bx - ax, by - ay) || 1;
  const bow = jitter(rand, Math.min(amp, len * 0.012 + 0.6));
  const cx = (ax + bx) / 2 + (-(by - ay) / len) * bow;
  const cy = (ay + by) / 2 + ((bx - ax) / len) * bow;
  return { d: `M${round(ax)} ${round(ay)} Q${round(cx)} ${round(cy)} ${round(bx)} ${round(by)}`, cx, cy, bx, by };
};

const roughRect = (rand: () => number, { x, y, w, h }: Box, passes: number) => {
  const corners = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  const parts: string[] = [];
  for (let p = 0; p < passes; p++) {
    for (let i = 0; i < 4; i++) {
      const [ax, ay] = corners[i];
      const [bx, by] = corners[(i + 1) % 4];
      parts.push(roughSegment(rand, ax, ay, bx, by, 2.2, 1.3).d);
    }
  }
  return parts.join(' ');
};

const dashArray = (dash: string) => (dash === 'dashed' ? '8 7' : dash === 'dotted' ? '2.5 6' : null);

export const renderSvg = (d: Diagram) => {
  const rand = seeded([...d.id].reduce((s, c) => s * 31 + c.charCodeAt(0), 7));
  const out: string[] = [];
  const desc = d.edges.map((e) => `${nodeOf(d, e.from).title} to ${nodeOf(d, e.to).title}: ${e.label.replace(/\n/g, ' ')}`).join('. ');
  out.push(
    `<svg class="xd" viewBox="0 0 ${d.W} ${d.H}" role="img" aria-labelledby="xd-${d.id}-title xd-${d.id}-desc"><title id="xd-${d.id}-title">${esc(d.title)}</title><desc id="xd-${d.id}-desc">${esc(desc)}</desc>`,
  );

  for (const z of d.zones ?? []) {
    out.push(`<path d="${roughRect(rand, z, 1)}" fill="none" stroke="${STYLE.zone.svg}" stroke-width="1.6" stroke-dasharray="8 7" stroke-linecap="round"/>`);
    out.push(`<text x="${z.x + 14}" y="${z.y + 22}" class="xd-zone">${esc(z.label)}</text>`);
  }

  for (const n of d.nodes) {
    const s = STYLE[n.state];
    const dash = dashArray(s.dash);
    out.push(`<rect x="${n.x + 2}" y="${n.y + 2}" width="${n.w - 4}" height="${n.h - 4}" fill="${s.fill}"/>`);
    out.push(
      `<path d="${roughRect(rand, n, dash ? 1 : 2)}" fill="none" stroke="${s.svg}" stroke-width="${dash ? 2 : 1.7}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`,
    );
    const lines = n.lines ?? [];
    let ty = n.y + (n.h - (24 + lines.length * 19)) / 2 + 18;
    const cx = n.x + n.w / 2;
    out.push(`<text x="${cx}" y="${round(ty)}" class="xd-title" fill="${s.svg}">${esc(n.title)}</text>`);
    ty += 25;
    for (const line of lines) {
      out.push(`<text x="${cx}" y="${round(ty)}" class="xd-line">${esc(line)}</text>`);
      ty += 19;
    }
  }

  for (const e of d.edges) {
    const s = STYLE[e.state];
    const { x1, y1, x2, y2 } = edgePoints(d, e);
    const dash = dashArray(s.dash);
    let last = roughSegment(rand, x1, y1, x2, y2, 3, 0.4);
    out.push(`<path d="${last.d}" fill="none" stroke="${s.svg}" stroke-width="1.8" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
    if (!dash) {
      last = roughSegment(rand, x1, y1, x2, y2, 3, 1);
      out.push(`<path d="${last.d}" fill="none" stroke="${s.svg}" stroke-width="1.8" stroke-linecap="round"/>`);
    }
    const angle = Math.atan2(last.by - last.cy, last.bx - last.cx);
    const head = [0.45, -0.45]
      .map((da) => `M${round(last.bx)} ${round(last.by)} L${round(last.bx - 13 * Math.cos(angle + da) + jitter(rand, 0.8))} ${round(last.by - 13 * Math.sin(angle + da) + jitter(rand, 0.8))}`)
      .join(' ');
    out.push(`<path d="${head}" fill="none" stroke="${s.svg}" stroke-width="1.9" stroke-linecap="round"/>`);

    const lines = e.label.split('\n');
    const lw = longest(e.label) * SVG_LINE * SVG_CHAR_EM + 12;
    const lh = lines.length * 17 + 6;
    const mx = (x1 + x2) / 2 + (e.labelDx ?? 0);
    const my = (y1 + y2) / 2 + (e.labelDy ?? 0);
    out.push(`<rect x="${round(mx - lw / 2)}" y="${round(my - lh / 2)}" width="${round(lw)}" height="${round(lh)}" rx="3" fill="var(--d-canvas)" opacity=".92"/>`);
    lines.forEach((line, i) => out.push(`<text x="${round(mx)}" y="${round(my - lh / 2 + 15 + i * 17)}" class="xd-edge" fill="${s.svg}">${esc(line)}</text>`));
  }

  for (const note of d.notes ?? []) {
    note.text.split('\n').forEach((line, i) => out.push(`<text x="${note.x}" y="${note.y + i * 18}" class="xd-note" fill="${STYLE[note.state].svg}">${esc(line)}</text>`));
  }

  out.push('</svg>');
  return out.join('');
};

const scaled = (d: Diagram, k: number): Diagram => ({
  ...d,
  W: d.W * k,
  H: d.H * k,
  nodes: d.nodes.map((n) => ({ ...n, x: n.x * k, y: n.y * k, w: n.w * k, h: n.h * k })),
  zones: (d.zones ?? []).map((z) => ({ ...z, x: z.x * k, y: z.y * k, w: z.w * k, h: z.h * k })),
  notes: (d.notes ?? []).map((n) => ({ ...n, x: n.x * k, y: n.y * k })),
  edges: d.edges.map((e) => ({
    ...e,
    fromOffset: (e.fromOffset ?? 0) * k,
    toOffset: (e.toOffset ?? 0) * k,
    labelDx: (e.labelDx ?? 0) * k,
    labelDy: (e.labelDy ?? 0) * k,
  })),
});

export const renderExcalidraw = (spec: Diagram) => {
  const d = scaled(spec, EXCALIDRAW_SCALE);
  let seed = 1000;
  const nextSeed = () => (seed += 97);
  const base = (props: Element): Element => ({
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: nextSeed(),
    version: 1,
    versionNonce: nextSeed() * 13,
    isDeleted: false,
    boundElements: [],
    updated: 1791331200000,
    link: null,
    locked: false,
    ...props,
  });
  const text = ({ text, fontSize, cx, cy, ...props }: { text: string; fontSize: number; cx: number; cy: number } & Element): Element => {
    const width = longest(text) * fontSize * EXCALIDRAW_CHAR_EM;
    const height = text.split('\n').length * fontSize * 1.25;
    return base({
      type: 'text',
      text,
      originalText: text,
      fontSize,
      fontFamily: 5,
      textAlign: 'center',
      verticalAlign: 'middle',
      autoResize: true,
      lineHeight: 1.25,
      width,
      height,
      x: cx - width / 2,
      y: cy - height / 2,
      ...props,
    });
  };

  const elements: Element[] = [];
  const prefix = `${d.id}-`;

  (d.zones ?? []).forEach((z, i) => {
    elements.push(base({ id: `${prefix}zone-${i}`, type: 'rectangle', x: z.x, y: z.y, width: z.w, height: z.h, strokeColor: STYLE.zone.stroke, strokeStyle: 'dashed', strokeWidth: 1, roundness: { type: 3 } }));
    const label = text({ id: `${prefix}zone-${i}-label`, text: z.label, fontSize: 16, cx: 0, cy: 0, strokeColor: STYLE.zone.stroke, textAlign: 'left' });
    elements.push({ ...label, x: z.x + 14, y: z.y + 10 });
  });

  const rects = new Map<string, Element & { boundElements: { type: string; id: string }[] }>();
  for (const n of d.nodes) {
    const s = STYLE[n.state];
    const rect = base({
      id: `${prefix}${n.id}`,
      type: 'rectangle',
      x: n.x,
      y: n.y,
      width: n.w,
      height: n.h,
      strokeColor: s.stroke,
      backgroundColor: s.bg,
      strokeStyle: s.dash,
      roundness: { type: 3 },
      boundElements: [{ type: 'text', id: `${prefix}${n.id}-text` }],
    }) as Element & { boundElements: { type: string; id: string }[] };
    rects.set(n.id, rect);
    elements.push(rect);
    elements.push(text({ id: `${prefix}${n.id}-text`, text: [n.title, ...(n.lines ?? [])].join('\n'), fontSize: EXCALIDRAW_FONT, cx: n.x + n.w / 2, cy: n.y + n.h / 2, containerId: rect.id, strokeColor: s.stroke }));
  }

  d.edges.forEach((e, i) => {
    const s = STYLE[e.state];
    const { x1, y1, x2, y2 } = edgePoints(d, e);
    const id = `${prefix}edge-${i}`;
    const from = rects.get(e.from)!;
    const to = rects.get(e.to)!;
    from.boundElements.push({ type: 'arrow', id });
    to.boundElements.push({ type: 'arrow', id });
    elements.push(
      base({
        id,
        type: 'arrow',
        x: x1,
        y: y1,
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
        points: [
          [0, 0],
          [x2 - x1, y2 - y1],
        ],
        strokeColor: s.stroke,
        strokeStyle: s.dash,
        roundness: { type: 2 },
        startBinding: { elementId: from.id, focus: 0, gap: GAP },
        endBinding: { elementId: to.id, focus: 0, gap: GAP },
        startArrowhead: null,
        endArrowhead: 'arrow',
        lastCommittedPoint: null,
        elbowed: false,
        boundElements: [{ type: 'text', id: `${id}-label` }],
      }),
    );
    elements.push(text({ id: `${id}-label`, text: e.label, fontSize: EXCALIDRAW_FONT, cx: (x1 + x2) / 2 + (e.labelDx ?? 0), cy: (y1 + y2) / 2 + (e.labelDy ?? 0), containerId: id, strokeColor: s.stroke }));
  });

  (d.notes ?? []).forEach((note, i) => elements.push(text({ id: `${prefix}note-${i}`, text: note.text, fontSize: 15, cx: note.x, cy: note.y, strokeColor: STYLE[note.state].stroke })));

  elements.push(
    text({
      id: `${prefix}legend`,
      text: 'black = on main · blue = built on a branch · orange dashed = proposed · red dotted = failure path',
      fontSize: 13,
      cx: d.W / 2,
      cy: d.H + 24,
      strokeColor: '#868e96',
    }),
  );

  return {
    height: d.H,
    file: { type: 'excalidraw', version: 2, source: 'https://excalidraw.com', elements, appState: { viewBackgroundColor: '#ffffff', gridSize: null }, files: {} },
    clipboard: { type: 'excalidraw/clipboard', elements, files: {} },
  };
};

const resolveCanvas = (flag: string | undefined) => {
  if (flag) return flag;
  if (process.env.EXPRESS_SERVER_URL) return process.env.EXPRESS_SERVER_URL;
  try {
    const url = execFileSync('excalidraw-inbox', ['--url'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (url) return url;
  } catch {}
  return 'http://127.0.0.1:3000';
};

const canvasUp = async (canvas: string) => {
  try {
    const res = await fetch(`${canvas}/health`, { signal: AbortSignal.timeout(1500) });
    return res.ok && (await res.json()).service === 'mcp-excalidraw-canvas';
  } catch {
    return false;
  }
};

const pushToCanvas = async ({ canvas, diagrams, replace }: { canvas: string; diagrams: Diagram[]; replace: boolean }) => {
  let offsetY = 0;
  if (!replace) {
    const prefixes = diagrams.map((d) => `${d.id}-`);
    const existing = (await (await fetch(`${canvas}/api/elements`)).json()).elements as { id: string; y?: number; height?: number; isDeleted?: boolean }[];
    const live = existing.filter((el) => !el.isDeleted);
    const ours = live.filter((el) => prefixes.some((p) => el.id.startsWith(p)));
    const others = live.filter((el) => !ours.includes(el));
    for (const el of ours) await fetch(`${canvas}/api/elements/${encodeURIComponent(el.id)}`, { method: 'DELETE' });
    if (others.length) offsetY = Math.max(...others.map((el) => (el.y ?? 0) + (el.height ?? 0))) + 200;
  }
  const elements: Element[] = [];
  for (const d of diagrams) {
    const { clipboard, height } = renderExcalidraw(d);
    elements.push({ id: `${d.id}-heading`, type: 'text', x: 0, y: offsetY - 56, text: d.title, fontSize: 28, fontFamily: 5, strokeColor: '#1e1e1e' });
    for (const el of clipboard.elements) elements.push({ ...el, y: (el.y as number) + offsetY });
    offsetY += height + 140;
  }
  const res = await fetch(`${canvas}/api/elements/batch`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ elements, replace }),
  });
  const body = await res.json();
  if (!res.ok || !body.success) throw new Error(`canvas refused the push (${res.status}): ${body.error ?? 'unknown error'}`);
  return body.count as number;
};

const main = async () => {
  const { values } = parseArgs({
    options: {
      spec: { type: 'string' },
      out: { type: 'string' },
      canvas: { type: 'string' },
      'no-canvas': { type: 'boolean', default: false },
      replace: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
  });
  if (values.help || !values.spec || !values.out) {
    console.log(HELP);
    process.exit(values.help ? 0 : 1);
  }

  const spec = JSON.parse(readFileSync(values.spec, 'utf8'));
  const diagrams: Diagram[] = Array.isArray(spec) ? spec : spec.diagrams;
  const errors = validate(diagrams ?? []);
  if (errors.length) {
    console.error(`Spec has ${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
    process.exit(1);
  }

  mkdirSync(values.out, { recursive: true });
  const scenes: Record<string, unknown> = {};
  const index = [];
  const warnings: string[] = [];
  for (const d of diagrams) {
    const { file, clipboard } = renderExcalidraw(d);
    writeFileSync(join(values.out, `${d.id}.svg`), renderSvg(d));
    writeFileSync(join(values.out, `${d.id}.excalidraw`), JSON.stringify(file, null, 2));
    scenes[d.id] = clipboard;
    index.push({
      id: d.id,
      title: d.title,
      edges: d.edges.map((e) => ({ from: nodeOf(d, e.from).title, to: nodeOf(d, e.to).title, label: e.label.replace(/\n/g, ' '), state: e.state })),
    });
    warnings.push(...fitWarnings(d));
  }
  writeFileSync(join(values.out, 'scenes.json'), JSON.stringify(scenes));
  writeFileSync(join(values.out, 'index.json'), JSON.stringify(index, null, 2));
  console.log(`Wrote ${diagrams.length} diagram(s) to ${values.out}`);
  if (warnings.length) console.log(`Fit warnings:\n  ${warnings.join('\n  ')}`);

  if (values['no-canvas']) return;
  const canvas = resolveCanvas(values.canvas);
  if (!(await canvasUp(canvas))) {
    console.log(`No canvas at ${canvas}. Files are written; to see them live, start one with \`excalidraw-inbox --start\` (excalidraw skill) or \`cd ~/mcp/excalidraw && PORT=3000 node dist/server.js\`, then rerun.`);
    return;
  }
  const count = await pushToCanvas({ canvas, diagrams, replace: values.replace });
  console.log(`Pushed ${count} elements to ${canvas}${values.replace ? ' (replaced its contents)' : ''}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
