// The constellation plate: an authored SVG map of entries, territories and shared ideas.

import { s } from './dom.js';
import { ITEMS, REGIONS, RELATIONS } from './content.js';

const W = 1000;
const H = 700;
const COLS = 'ABCDEFGHIJ';

function gridTicks() {
  const cols = [...COLS].map((letter, i) => s('text', { x: i * 100 + 50, y: 22, class: 'map-coord' }, letter));
  const rows = Array.from({ length: 7 }, (_, i) =>
    s('text', { x: 14, y: i * 100 + 54, class: 'map-coord' }, String(i + 1)));
  const lines = Array.from({ length: 9 }, (_, i) =>
    s('line', { x1: (i + 1) * 100, y1: 32, x2: (i + 1) * 100, y2: H - 8, class: 'map-grid' }));
  return s('g', { 'aria-hidden': 'true' }, lines, cols, rows);
}

function region(r) {
  const rings = [1, 0.72, 0.44].map((k, i) =>
    s('ellipse', {
      cx: r.x, cy: r.y, rx: Math.round(r.rx * k), ry: Math.round(r.ry * k),
      class: `contour contour-${i}`,
    }));
  const label = s('text', { x: r.x - r.rx + 24, y: r.y - r.ry + 46, class: 'region-label' }, r.label);
  return s('g', { class: 'region', 'data-region': r.id, 'aria-hidden': 'true' }, rings, label);
}

function curve(a, b) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = Math.round(mx - (dy / len) * 34);
  const cy = Math.round(my + (dx / len) * 34);
  return { d: `M${a.x} ${a.y}Q${cx} ${cy} ${b.x} ${b.y}`, label: { x: (mx + cx) / 2, y: (my + cy) / 2 } };
}

function edge(rel) {
  const a = ITEMS.find((i) => i.id === rel.a).pos;
  const b = ITEMS.find((i) => i.id === rel.b).pos;
  const { d, label } = curve(a, b);
  return s('g', { class: 'edge', 'data-a': rel.a, 'data-b': rel.b, 'aria-hidden': 'true' },
    s('path', { d, class: 'edge-base' }),
    s('path', { d, class: 'edge-ink', pathLength: 1 }),
    s('text', { x: Math.round(label.x), y: Math.round(label.y) - 6, class: 'edge-label' }, rel.label.toUpperCase()));
}

function marker(item) {
  return item.kind === 'paper'
    ? s('rect', { x: -10, y: -10, width: 20, height: 20, class: 'node-mark', transform: 'rotate(45)' })
    : s('rect', { x: -10, y: -10, width: 20, height: 20, class: 'node-mark' });
}

function node(item) {
  const kind = item.kind === 'paper' ? 'paper' : 'project';
  return s('g', {
    class: `node node-${kind}`,
    'data-id': item.id,
    transform: `translate(${item.pos.x} ${item.pos.y})`,
    role: 'button',
    tabindex: '-1',
    'aria-label': `${item.index} ${item.title}, ${kind}`,
    'aria-pressed': 'false',
  },
  s('circle', { r: 30, class: 'node-hit' }),
  s('circle', { r: 21, class: 'node-ring' }),
  marker(item),
  s('text', { x: 0, y: -22, class: 'node-index' }, item.index),
  s('text', { x: 0, y: 40, class: 'node-title' }, item.title));
}

function furniture() {
  return s('g', { class: 'map-furniture', 'aria-hidden': 'true' },
    s('path', { d: 'M940 600L952 640L940 632L928 640Z', class: 'compass' }),
    s('text', { x: 940, y: 592, class: 'map-coord' }, 'N'),
    s('line', { x1: 760, y1: 672, x2: 960, y2: 672, class: 'scale' }),
    [0, 50, 100, 150, 200].map((dx) =>
      s('line', { x1: 760 + dx, y1: 666, x2: 760 + dx, y2: 678, class: 'scale' })),
    s('text', { x: 760, y: 658, class: 'map-coord map-coord-left' }, 'SCALE: CONCEPTUAL'));
}

export function createAtlas({ onSelect }) {
  const svg = s('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'atlas-map',
    role: 'group',
    'aria-label': 'Constellation map of projects and papers. Use arrow keys to move between entries and Enter to select.',
  },
  gridTicks(),
  s('g', { class: 'regions' }, REGIONS.map(region)),
  s('g', { class: 'edges' }, RELATIONS.map(edge)),
  s('g', { class: 'nodes' }, ITEMS.map(node)),
  furniture());

  wireAtlas(svg, onSelect);
  return svg;
}

function nodes(svg) {
  return [...svg.querySelectorAll('.node')];
}

function setHover(svg, id) {
  svg.querySelectorAll('.edge').forEach((e) => {
    e.classList.toggle('is-hover', Boolean(id) && (e.dataset.a === id || e.dataset.b === id));
  });
  nodes(svg).forEach((n) => n.classList.toggle('is-hover', n.dataset.id === id));
}

function moveFocus(svg, current, step) {
  const list = nodes(svg).filter((n) => !n.classList.contains('is-muted'));
  if (list.length === 0) return;
  const at = list.indexOf(current);
  const next = list[(at + step + list.length) % list.length];
  list.forEach((n) => n.setAttribute('tabindex', n === next ? '0' : '-1'));
  next.focus();
}

const KEY_STEPS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

function wireAtlas(svg, onSelect) {
  svg.addEventListener('click', (event) => {
    const target = event.target.closest('.node');
    if (target && !target.classList.contains('is-muted')) onSelect(target.dataset.id);
  });
  svg.addEventListener('keydown', (event) => {
    const target = event.target.closest('.node');
    if (!target) return;
    if (event.key in KEY_STEPS) {
      event.preventDefault();
      moveFocus(svg, target, KEY_STEPS[event.key]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(target.dataset.id);
    }
  });
  svg.addEventListener('pointerover', (event) => setHover(svg, event.target.closest('.node')?.dataset.id ?? null));
  svg.addEventListener('pointerleave', () => setHover(svg, null));
  svg.addEventListener('focusin', (event) => setHover(svg, event.target.closest('.node')?.dataset.id ?? null));
  svg.addEventListener('focusout', () => setHover(svg, null));
}

function rovingTarget(list, selectedId, visible) {
  const selected = list.find((n) => n.dataset.id === selectedId && visible.has(n.dataset.id));
  return selected ?? list.find((n) => visible.has(n.dataset.id)) ?? null;
}

export function updateAtlas(svg, { selectedId, visibleIds }) {
  const visible = new Set(visibleIds);
  const related = new Set(RELATIONS.flatMap((r) =>
    r.a === selectedId ? [r.b] : r.b === selectedId ? [r.a] : []));
  const list = nodes(svg);
  const roving = rovingTarget(list, selectedId, visible);
  list.forEach((n) => {
    const id = n.dataset.id;
    n.classList.toggle('is-selected', id === selectedId);
    n.classList.toggle('is-related', related.has(id));
    n.classList.toggle('is-muted', !visible.has(id));
    n.setAttribute('aria-pressed', String(id === selectedId));
    n.setAttribute('aria-hidden', String(!visible.has(id)));
    n.setAttribute('tabindex', n === roving ? '0' : '-1');
  });
  svg.querySelectorAll('.edge').forEach((e) => {
    e.classList.toggle('is-active', e.dataset.a === selectedId || e.dataset.b === selectedId);
  });
}
