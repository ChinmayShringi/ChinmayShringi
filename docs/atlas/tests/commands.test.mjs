import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCommands, filterCommands } from '../src/commands.js';

function createItems() {
  return Object.freeze([
    Object.freeze({
      id: 'sourcesnap', index: '01', kind: 'project', title: 'SourceSnap',
      subtitle: 'Source-grounded capture', technologies: Object.freeze(['TypeScript', 'React']),
    }),
    Object.freeze({
      id: 'graft-paper', index: '02', kind: 'paper', title: 'GRAFT',
      subtitle: 'Device routing research', technologies: Object.freeze(['Python']),
    }),
  ]);
}

test('catalog preserves item identity, project/paper grouping and selection actions', () => {
  const items = createItems();
  const commands = buildCommands(items);
  const project = commands.find(({ id }) => id === 'open:sourcesnap');
  const paper = commands.find(({ id }) => id === 'open:graft-paper');

  assert.equal(project.group, 'Projects');
  assert.equal(paper.group, 'Papers');
  assert.ok(project.label.includes('SourceSnap'));
  assert.ok(paper.label.includes('GRAFT'));
  assert.deepEqual(project.action, { type: 'select', id: 'sourcesnap' });
  assert.deepEqual(paper.action, { type: 'select', id: 'graft-paper' });
  assert.deepEqual(items, createItems());
});

test('catalog includes working section and preference actions without item commands', () => {
  const commands = buildCommands(Object.freeze([]));
  const actions = commands.map(({ action }) => action);

  for (const target of ['atlas', 'lab', 'research', 'contact']) {
    assert.ok(actions.some((action) => action.type === 'goto' && action.target === target));
  }
  for (const value of ['system', 'light', 'dark']) {
    assert.ok(actions.some((action) => action.type === 'theme' && action.value === value));
  }
  for (const value of ['auto', 'off']) {
    assert.ok(actions.some((action) => action.type === 'motion' && action.value === value));
  }
  assert.equal(commands.some(({ action }) => action.type === 'select'), false);
});

test('command search matches every case-insensitive word across catalog fields', () => {
  const commands = buildCommands(createItems());
  const cases = [
    { query: '  REACT   sourceSnap  ', expected: ['open:sourcesnap'] },
    { query: 'sourcesnap projects capture', expected: ['open:sourcesnap'] },
    { query: '  PYTHON\tPapers  ', expected: ['open:graft-paper'] },
    { query: 'graft vision', expected: [] },
    { query: 'preferences DARK', expected: ['theme:dark'] },
  ];

  for (const { query, expected } of cases) {
    assert.deepEqual(filterCommands(commands, query).map(({ id }) => id), expected, query);
  }
});

test('empty command queries return an independent array with the original command objects', () => {
  const commands = buildCommands(createItems());

  for (const query of ['', '  \t\n ']) {
    const result = filterCommands(commands, query);
    assert.notStrictEqual(result, commands);
    assert.deepEqual(result, commands);
    assert.strictEqual(result[0], commands[0]);
  }
});

test('search leaves frozen command data intact and preserves result references', () => {
  const items = createItems();
  const commands = buildCommands(items);
  const result = filterCommands(commands, 'typescript');

  assert.deepEqual(result.map(({ id }) => id), ['open:sourcesnap']);
  assert.strictEqual(result[0], commands[0]);
  assert.deepEqual(commands, buildCommands(createItems()));
  assert.deepEqual(items, createItems());
});
