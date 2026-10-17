// Immutable application state: a pure reducer plus a tiny subscription store.

export const THEMES = Object.freeze(['system', 'light', 'dark']);
export const MOTIONS = Object.freeze(['auto', 'off']);

export function createInitialState(overrides = {}) {
  return Object.freeze({
    query: '',
    domain: 'all',
    selectedId: null,
    theme: 'system',
    motion: 'auto',
    routing: Object.freeze({ capability: 'vision', allowRemote: true }),
    ...overrides,
  });
}

function updateField(state, key, value) {
  return state[key] === value ? state : { ...state, [key]: value };
}

function updateRouting(state, key, value) {
  if (state.routing[key] === value) return state;
  return { ...state, routing: Object.freeze({ ...state.routing, [key]: value }) };
}

const handlers = Object.freeze({
  query: (state, { value }) => updateField(state, 'query', String(value)),
  domain: (state, { value }) => updateField(state, 'domain', String(value)),
  select: (state, { id }) => updateField(state, 'selectedId', id ?? null),
  theme: (state, { value }) => (THEMES.includes(value) ? updateField(state, 'theme', value) : state),
  motion: (state, { value }) => (MOTIONS.includes(value) ? updateField(state, 'motion', value) : state),
  capability: (state, { value }) => updateRouting(state, 'capability', String(value)),
  allowRemote: (state, { value }) => updateRouting(state, 'allowRemote', Boolean(value)),
  resetFilters: (state) => (state.query === '' && state.domain === 'all'
    ? state : { ...state, query: '', domain: 'all' }),
});

export function reduce(state, action) {
  if (!Object.hasOwn(handlers, action?.type)) return state;
  const handler = handlers[action.type];
  const next = handler(state, action);
  return next === state ? state : Object.freeze(next);
}

export function createStore(initial) {
  let current = initial;
  let listeners = Object.freeze([]);
  return Object.freeze({
    getState: () => current,
    dispatch(action) {
      const previous = current;
      current = reduce(current, action);
      if (current !== previous) listeners.forEach((fn) => fn(current, previous));
    },
    subscribe(fn) {
      listeners = Object.freeze([...listeners, fn]);
      return () => {
        listeners = Object.freeze(listeners.filter((l) => l !== fn));
      };
    },
  });
}
