# Diagram spec and page snippets

`scripts/diagrams.ts` reads one JSON file and renders each diagram three ways from the same coordinates: a hand-drawn SVG fragment for the page, an `.excalidraw` scene, and a push to the live canvas. A synthetic example lives in [examples/saved-carts.json](examples/saved-carts.json).

## Spec

```json
{
  "diagrams": [
    {
      "id": "today",
      "title": "Today on main",
      "W": 1060,
      "H": 330,
      "zones": [{ "x": 265, "y": 28, "w": 600, "h": 236, "label": "orders table · pk = CART#<cartId>" }],
      "nodes": [
        { "id": "web", "x": 40, "y": 40, "w": 200, "h": 100, "title": "Web app", "lines": ["one browser"], "state": "current" }
      ],
      "edges": [
        { "from": "web", "to": "api", "label": "cart JSON", "state": "new", "fromSide": "r", "toSide": "l", "fromOffset": -20, "labelDy": -14 }
      ],
      "notes": [{ "x": 910, "y": 274, "text": "cart is lost on logout", "state": "fail" }]
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `state` | `current` (on main), `built` (on a branch, not merged), `new` (proposed), `fail` (failure path), `rule` (an invariant, drawn muted and dotted) |
| `W`, `H` | viewBox size. 1060 wide fits a 960px column; the SVG scrolls sideways under 760px |
| `zones` | dashed grouping boxes, such as one table or one service boundary. Drawn behind nodes |
| `fromSide`, `toSide` | `l`, `r`, `t`, `b`. Omitted sides are picked from the nodes' relative position |
| `fromOffset`, `toOffset` | slide the anchor along its side, to separate arrows that leave the same box |
| `labelDx`, `labelDy` | move an edge label off its arrow's midpoint |
| `\n` in labels or notes | line break |

Layout rules that keep labels readable:

- Leave a horizontal gap between boxes at least as wide as the edge label, or break the label with `\n`.
- Titles are about 9.6px per character on the page; lines about 7.4px. The script warns when a box is too narrow on the page or the canvas.
- Six nodes or fewer per diagram. Split a busy flow into two diagrams.

## Page CSS

Put these tokens in the page's `:root` and both dark-mode blocks, and the classes anywhere in its `<style>`. The diagram font loads from Google Fonts: `family=Patrick+Hand`.

```css
:root {
  --d-canvas: #fffdf9; --d-dot: #e4ded2; --d-ink: #1e2328; --d-fill: #ffffff;
  --d-built: #1b67ad; --d-built-fill: #e6f1fb; --d-new: #c95a0c; --d-new-fill: #fff2e4;
  --d-warn: #b02a2a; --d-warn-fill: #fdeeee; --d-muted: #7f8892;
  --hand: "Patrick Hand", "Comic Sans MS", "Segoe Print", cursive;
}
/* dark values, for both the prefers-color-scheme block and :root[data-theme="dark"] */
/* --d-canvas: #1d2024; --d-dot: #30353b; --d-ink: #e6e2d9; --d-fill: #24282d;
   --d-built: #79b6ec; --d-built-fill: #1c2c3c; --d-new: #f2a45f; --d-new-fill: #352718;
   --d-warn: #f08f8f; --d-warn-fill: #3a2323; --d-muted: #8a939c; */

section { display: grid; grid-template-columns: minmax(0, 1fr); }
section > * { min-width: 0; }
.canvas { overflow-x: auto; border-radius: 6px; background-color: var(--d-canvas);
  background-image: radial-gradient(var(--d-dot) 1px, transparent 1.2px); background-size: 20px 20px; padding: 14px 10px; }
.xd { display: block; width: 100%; min-width: 760px; height: auto; }
.xd-title { font-family: var(--hand); font-size: 20px; text-anchor: middle; }
.xd-line { font-family: var(--hand); font-size: 15.5px; text-anchor: middle; fill: var(--d-ink); opacity: .86; }
.xd-edge, .xd-note { font-family: var(--hand); font-size: 15.5px; text-anchor: middle; }
.xd-zone { font-family: var(--hand); font-size: 16px; fill: var(--d-muted); }
```

`grid-template-columns: minmax(0, 1fr)` matters: without it a grid section grows to the SVG's 760px minimum and the whole page scrolls sideways on a phone.

## Figure markup

One figure per diagram. Inline `<id>.svg` inside `.canvas`, and build the text equivalent from `index.json`.

```html
<figure class="fig">
  <div class="fig-bar"><span class="fig-name">Today on main</span>
    <button type="button" class="copy" data-scene="today" id="copy-today">Copy to Excalidraw</button></div>
  <div class="canvas"><!-- contents of today.svg --></div>
  <textarea class="fallback" id="fallback-today" hidden readonly aria-label="Excalidraw scene JSON"></textarea>
  <figcaption>What the diagram shows, in one or two sentences.</figcaption>
  <details><summary>Diagram as text</summary><ul><!-- one li per edge: from → to: label --></ul></details>
</figure>
```

## Copy to Excalidraw

Inline `scenes.json` (escape `<` as `<`) and this script. Pasting the copied JSON into excalidraw.com drops the diagram onto its canvas.

```html
<script>
(() => {
  const scenes = /* contents of scenes.json */;
  document.querySelectorAll('button.copy').forEach((btn) => {
    btn.addEventListener('click', () => {
      const json = JSON.stringify(scenes[btn.dataset.scene]);
      const fallback = document.getElementById('fallback-' + btn.dataset.scene);
      const showFallback = () => {
        fallback.hidden = false;
        fallback.value = json;
        fallback.select();
        btn.textContent = 'Press Cmd+C, then paste into excalidraw.com';
      };
      try {
        navigator.clipboard.writeText(json).then(() => { btn.textContent = 'Copied. Paste into excalidraw.com'; }, showFallback);
      } catch (e) {
        showFallback();
      }
    });
  });
})();
</script>
```
