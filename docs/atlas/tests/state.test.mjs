import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState, createStore, reduce } from '../src/state.js';

test('initial state starts with usable filters, preferences and routing choices', () => {
  const state = createInitialState();

  assert.equal(state.query, '');
  assert.equal(state.domain, 'all');
  assert.equal(state.selectedId, null);
  assert.equal(state.theme, 'system');
  assert.equal(state.motion, 'auto');
  assert.deepEqual(state.routing, { capability: 'vision', allowRemote: true });
});

test('user filter, selection and preference actions update only their target field', () => {
  const initial = createInitialState();
  const cases = [
    { action: { type: 'query', value: 'sourcesnap' }, key: 'query', expected: 'sourcesnap' },
    { action: { type: 'domain', value: 'agents' }, key: 'domain', expected: 'agents' },
    { action: { type: 'select', id: 'graft' }, key: 'selectedId', expected: 'graft' },
    { action: { type: 'theme', value: 'dark' }, key: 'theme', expected: 'dark' },
    { action: { type: 'motion', value: 'off' }, key: 'motion', expected: 'off' },
  ];

  for (const { action, key, expected } of cases) {
    const next = reduce(initial, Object.freeze(action));
    assert.notStrictEqual(next, initial, action.type);
    assert.deepEqual(next, { ...initial, [key]: expected }, action.type);
    assert.strictEqual(next.routing, initial.routing, action.type);
  }
  assert.deepEqual(initial, createInitialState());
});

test('clearing a selection restores the unselected state', () => {
  const initial = createInitialState({ selectedId: 'graft' });
  const next = reduce(initial, Object.freeze({ type: 'select', id: null }));

  assert.equal(next.selectedId, null);
  assert.equal(initial.selectedId, 'graft');
});

test('routing actions replace nested state while preserving the other routing choice', () => {
  const initial = createInitialState();
  const next = reduce(initial, Object.freeze({ type: 'capability', value: 'text' }));
  const localOnly = reduce(next, Object.freeze({ type: 'allowRemote', value: false }));

  assert.notStrictEqual(next, initial);
  assert.notStrictEqual(next.routing, initial.routing);
  assert.notStrictEqual(localOnly.routing, next.routing);
  assert.deepEqual(initial.routing, { capability: 'vision', allowRemote: true });
  assert.deepEqual(next.routing, { capability: 'text', allowRemote: true });
  assert.deepEqual(localOnly.routing, { capability: 'text', allowRemote: false });
  assert.deepEqual(localOnly, {
    ...initial,
    routing: { capability: 'text', allowRemote: false },
  });
});

test('resetting filters preserves selected item, preferences and routing choices', () => {
  const routing = Object.freeze({ capability: 'text', allowRemote: false });
  const initial = createInitialState({
    query: 'python', domain: 'agents', selectedId: 'graft',
    theme: 'dark', motion: 'off', routing,
  });
  const next = reduce(initial, Object.freeze({ type: 'resetFilters' }));

  assert.deepEqual(next, { ...initial, query: '', domain: 'all' });
  assert.strictEqual(next.routing, routing);
  assert.equal(initial.query, 'python');
  assert.equal(initial.domain, 'agents');
});

test('invalid actions and unsupported preferences leave state untouched', () => {
  const initial = createInitialState();
  const actions = [
    null, undefined, Object.freeze({}), Object.freeze({ type: 'missing' }),
    Object.freeze({ type: false }), Object.freeze({ type: 'theme', value: 'sepia' }),
    Object.freeze({ type: 'motion', value: 'fast' }),
  ];

  for (const action of actions) {
    assert.strictEqual(reduce(initial, action), initial);
  }
});

for (const type of ['toString', 'valueOf', 'constructor', 'hasOwnProperty', '__proto__']) {
  test(`an inherited Object property is an unknown action: ${type}`, () => {
    const initial = createInitialState();

    assert.strictEqual(reduce(initial, Object.freeze({ type })), initial);
  });
}

test('store subscriptions receive current and previous state for actual changes only', () => {
  const initial = createInitialState();
  const store = createStore(initial);
  let notifications = Object.freeze([]);
  store.subscribe((next, previous) => {
    notifications = Object.freeze([...notifications, Object.freeze({ next, previous })]);
  });

  assert.strictEqual(store.getState(), initial);
  store.dispatch(Object.freeze({ type: 'query', value: 'graft' }));
  const filtered = store.getState();
  store.dispatch(Object.freeze({ type: 'missing' }));
  store.dispatch(Object.freeze({ type: 'query', value: 'graft' }));
  store.dispatch(Object.freeze({ type: 'allowRemote', value: false }));
  const localOnly = store.getState();

  assert.equal(notifications.length, 2);
  assert.strictEqual(notifications[0].previous, initial);
  assert.strictEqual(notifications[0].next, filtered);
  assert.strictEqual(notifications[1].previous, filtered);
  assert.strictEqual(notifications[1].next, localOnly);
  assert.equal(localOnly.routing.allowRemote, false);
});

test('unsubscribing stops that listener while other subscribers remain active', () => {
  const store = createStore(createInitialState());
  let firstCalls = 0;
  let secondCalls = 0;
  const unsubscribe = store.subscribe(() => { firstCalls += 1; });
  store.subscribe(() => { secondCalls += 1; });

  store.dispatch(Object.freeze({ type: 'theme', value: 'dark' }));
  unsubscribe();
  unsubscribe();
  store.dispatch(Object.freeze({ type: 'theme', value: 'light' }));

  assert.equal(firstCalls, 1);
  assert.equal(secondCalls, 2);
  assert.equal(store.getState().theme, 'light');
});
