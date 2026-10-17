import assert from 'node:assert/strict';
import test from 'node:test';
import { ITEMS } from '../src/content.js';
import { filterItems } from '../src/model.js';
import { buildCommands, filterCommands } from '../src/commands.js';

const queries = Object.freeze([
  Object.freeze({ query: 'An Advanced AI-Driven Database System', id: 'ai-database' }),
  Object.freeze({ query: '  AuToNoMoUs  ', id: 'branch-commit-validate' }),
  Object.freeze({ query: 'gRPC-Routed Agent Framework', id: 'graft' }),
]);

for (const { query, id } of queries) {
  test(`atlas search finds visible publication title text: ${query.trim()}`, () => {
    assert.deepEqual(filterItems(ITEMS, { query }).map((item) => item.id), [id]);
  });

  test(`command search finds visible publication title text: ${query.trim()}`, () => {
    const commands = buildCommands(ITEMS);

    assert.deepEqual(filterCommands(commands, query).map((command) => command.id), [`open:${id}`]);
  });
}
