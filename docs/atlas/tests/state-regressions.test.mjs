import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState, createStore, reduce } from '../src/state.js';

const equivalentActions = Object.freeze([
  Object.freeze({ type: 'query', value: '' }),
  Object.freeze({ type: 'domain', value: 'all' }),
  Object.freeze({ type: 'select', id: null }),
  Object.freeze({ type: 'theme', value: 'system' }),
  Object.freeze({ type: 'motion', value: 'auto' }),
  Object.freeze({ type: 'capability', value: 'vision' }),
  Object.freeze({ type: 'allowRemote', value: true }),
  Object.freeze({ type: 'resetFilters' }),
]);

for (const action of equivalentActions) {
  test(`an equivalent ${action.type} update preserves state identity`, () => {
    const initial = createInitialState();
    const next = reduce(initial, action);

    assert.strictEqual(next, initial);
    assert.strictEqual(next.routing, initial.routing);
  });
}

test('equivalent updates do not notify store subscribers', () => {
  const initial = createInitialState();
  const store = createStore(initial);
  let notifications = 0;
  store.subscribe(() => { notifications += 1; });

  for (const action of equivalentActions) store.dispatch(action);

  assert.equal(notifications, 0);
  assert.strictEqual(store.getState(), initial);
});
