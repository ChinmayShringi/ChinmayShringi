import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { ITEMS, RELATIONS, DOMAINS, LAB_DEVICES, LAB_CAPABILITIES, relationsFor } from '../src/content.js';

const ROOT = new URL('..', import.meta.url).pathname;

test('entries have unique ids and sequential two-digit indices', () => {
  assert.equal(new Set(ITEMS.map((i) => i.id)).size, ITEMS.length);
  assert.deepEqual(ITEMS.map((i) => i.index), ITEMS.map((_, n) => String(n + 1).padStart(2, '0')));
});

test('every entry has required public fields and secure links', () => {
  const domainIds = new Set(DOMAINS.map((d) => d.id));
  for (const item of ITEMS) {
    assert.ok(['project', 'paper'].includes(item.kind), item.id);
    assert.ok(item.title && item.summary && item.detail, item.id);
    assert.ok(item.links.length > 0, item.id);
    item.links.forEach((link) => assert.match(link.href, /^https:\/\//, item.id));
    item.domains.forEach((d) => assert.ok(domainIds.has(d), `${item.id}: ${d}`));
    if (item.kind === 'paper') assert.ok(item.fullTitle, item.id);
  }
});

test('relations join known, distinct entries and are reachable from both ends', () => {
  const ids = new Set(ITEMS.map((i) => i.id));
  for (const r of RELATIONS) {
    assert.ok(ids.has(r.a) && ids.has(r.b) && r.a !== r.b, `${r.a}-${r.b}`);
    assert.ok(relationsFor(r.a).some((x) => x.id === r.b));
    assert.ok(relationsFor(r.b).some((x) => x.id === r.a));
  }
});

test('content data is frozen', () => {
  assert.ok(Object.isFrozen(ITEMS) && Object.isFrozen(ITEMS[0]) && Object.isFrozen(ITEMS[0].links));
  assert.throws(() => { ITEMS[0].links.push({}); }, TypeError);
});

test('static HTML fallback stays in sync with content', async () => {
  const html = await readFile(join(ROOT, 'index.html'), 'utf8');
  for (const item of ITEMS) {
    assert.ok(html.includes(`href="${item.links[0].href}"`), `fallback link for ${item.id}`);
    if (item.kind === 'paper') assert.ok(html.includes(item.fullTitle), `research title for ${item.id}`);
  }
  const count = (kind) => String(ITEMS.filter((i) => i.kind === kind).length).padStart(2, '0');
  assert.ok(html.includes(`<dt>Projects</dt><dd>${count('project')}</dd>`));
  assert.ok(html.includes(`<dt>Papers</dt><dd>${count('paper')}</dd>`));
  assert.ok(html.includes(`<dt>Shared ideas</dt><dd>${String(RELATIONS.length).padStart(2, '0')}</dd>`));
});

test('lab sample includes an unsupported capability and a remote-only one', () => {
  const offered = new Set(LAB_DEVICES.flatMap((d) => d.capabilities));
  assert.ok(LAB_CAPABILITIES.some((c) => !offered.has(c.id)));
  assert.ok(LAB_CAPABILITIES.some((c) => LAB_DEVICES.every((d) => d.local !== d.capabilities.includes(c.id) || !d.local)
    && LAB_DEVICES.some((d) => !d.local && d.capabilities.includes(c.id))
    && !LAB_DEVICES.some((d) => d.local && d.capabilities.includes(c.id))));
});

async function sourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries
    .filter((e) => !['dist', 'node_modules', 'tests'].includes(e.name))
    .map((e) => (e.isDirectory() ? sourceFiles(join(dir, e.name)) : [join(dir, e.name)])));
  return nested.flat();
}

test('source files have no em dashes or emoji and stay under 800 lines', async () => {
  const files = (await sourceFiles(ROOT)).filter((f) => /\.(js|mjs|css|html|json|svg|md)$/.test(f));
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    assert.ok(!text.includes(String.fromCharCode(0x2014)), `em dash in ${file}`);
    assert.ok(!/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/u.test(text), `emoji in ${file}`);
    assert.ok(text.split('\n').length <= 800, `${file} exceeds 800 lines`);
  }
});
