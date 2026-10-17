import assert from 'node:assert/strict';
import test from 'node:test';
import {
  filterItems,
  getItem,
  parseSelectionHash,
  selectionHash,
} from '../src/model.js';

function createItems() {
  return Object.freeze([
    Object.freeze({
      id: 'sourcesnap',
      title: 'SourceSnap',
      summary: 'Source-grounded knowledge capture.',
      technologies: Object.freeze(['TypeScript', 'React']),
      domains: Object.freeze(['retrieval', 'agents']),
    }),
    Object.freeze({
      id: 'graft',
      title: 'GRAFT',
      summary: 'An illustrative device routing system.',
      technologies: Object.freeze(['Python']),
      domains: Object.freeze(['agents', 'routing']),
    }),
    Object.freeze({
      id: 'router/edge β',
      title: 'Edge Models',
      summary: 'Capability-aware inference.',
      technologies: Object.freeze(['Rust']),
      domains: Object.freeze(['systems']),
    }),
  ]);
}

test('unfiltered results contain the original items in a new array', () => {
  const items = createItems();
  const result = filterItems(items);

  assert.notStrictEqual(result, items);
  assert.deepEqual(result.map((item) => item.id), [
    'sourcesnap', 'graft', 'router/edge β',
  ]);
  assert.strictEqual(result[0], items[0]);
  assert.strictEqual(result[1], items[1]);
  assert.strictEqual(result[2], items[2]);
});

test('search trims whitespace and finds case-insensitive matches across fields', () => {
  const items = createItems();
  const cases = [
    { query: '  sOuRcEsNaP  ', expected: ['sourcesnap'] },
    { query: '  DeViCe RoUtInG  ', expected: ['graft'] },
    { query: '  tYpEsCrIpT  ', expected: ['sourcesnap'] },
    { query: '  SyStEmS  ', expected: ['router/edge β'] },
    { query: '  aGeNtS  ', expected: ['sourcesnap', 'graft'] },
    { query: 'missing phrase', expected: [] },
  ];

  for (const { query, expected } of cases) {
    const result = filterItems(items, Object.freeze({ query }));
    assert.deepEqual(result.map((item) => item.id), expected, query);
  }
});

test('a whitespace-only query behaves like an empty query', () => {
  const items = createItems();
  const result = filterItems(items, { query: ' \t\n ', domain: 'all' });

  assert.notStrictEqual(result, items);
  assert.deepEqual(result.map((item) => item.id), [
    'sourcesnap', 'graft', 'router/edge β',
  ]);
});

test('domain and search filters must both match', () => {
  const items = createItems();

  assert.deepEqual(
    filterItems(items, { domain: 'agents' }).map((item) => item.id),
    ['sourcesnap', 'graft'],
  );
  assert.deepEqual(
    filterItems(items, { query: 'python', domain: 'agents' })
      .map((item) => item.id),
    ['graft'],
  );
  assert.deepEqual(filterItems(items, { query: 'python', domain: 'retrieval' }), []);
  assert.deepEqual(filterItems(items, { domain: 'unknown' }), []);
});

test('lookup preserves a matching item reference and returns null for unknown ids', () => {
  const items = createItems();

  assert.strictEqual(getItem(items, 'graft'), items[1]);
  assert.strictEqual(getItem(items, 'GRAFT'), null);
  assert.strictEqual(getItem(items, 'missing'), null);
  assert.strictEqual(getItem(Object.freeze([]), 'graft'), null);
});

test('selection hashes encode reserved characters and restore the selected id', () => {
  const items = createItems();

  assert.equal(selectionHash('graft'), '#project/graft');
  assert.equal(selectionHash('router/edge β'), '#project/router%2Fedge%20%CE%B2');
  assert.equal(parseSelectionHash('#project/graft', items), 'graft');
  assert.equal(
    parseSelectionHash('#project/router%2Fedge%20%CE%B2', items),
    'router/edge β',
  );
  assert.equal(parseSelectionHash(selectionHash('router/edge β'), items), 'router/edge β');
});

test('selection restoration rejects malformed, unrelated and unknown hashes', () => {
  const items = createItems();
  const invalidHashes = [
    '', '#', '#project/', '#project/missing', '#paper/graft',
    'project/graft', '#project/graft/extra', '#project/%ZZ', '#project/%E0%A4%A',
  ];

  for (const hash of invalidHashes) {
    assert.equal(parseSelectionHash(hash, items), null, hash);
  }
  assert.equal(parseSelectionHash('#project/graft', Object.freeze([])), null);
});

test('empty item collections produce an independent empty result', () => {
  const items = Object.freeze([]);
  const result = filterItems(items, { query: 'anything', domain: 'all' });

  assert.deepEqual(result, []);
  assert.notStrictEqual(result, items);
});

test('filtering and selection leave frozen source data and options unchanged', () => {
  const items = createItems();
  const options = Object.freeze({ query: '  PYTHON ', domain: 'agents' });
  const result = filterItems(items, options);

  assert.strictEqual(result[0], items[1]);
  assert.strictEqual(getItem(items, 'graft'), items[1]);
  assert.equal(parseSelectionHash('#project/graft', items), 'graft');
  assert.deepEqual(options, { query: '  PYTHON ', domain: 'agents' });
  assert.deepEqual(items, createItems());
});
