// The entry index: search, domain filters and the full, map-independent list.

import { h, replaceChildren } from './dom.js';
import { DOMAINS } from './content.js';

function domainChip(domain, dispatch) {
  const id = `domain-${domain.id}`;
  return h('span', { class: 'chip' },
    h('input', {
      type: 'radio', name: 'domain', id, value: domain.id,
      onchange: (event) => dispatch({ type: 'domain', value: event.target.value }),
    }),
    h('label', { for: id }, domain.label));
}

export function createIndexControls(root, dispatch) {
  const search = h('input', {
    type: 'search', id: 'atlas-search', class: 'search-input', autocomplete: 'off', spellcheck: 'false',
    placeholder: 'Search titles, stacks, ideas', 'aria-describedby': 'search-hint',
    oninput: (event) => dispatch({ type: 'query', value: event.target.value }),
  });
  replaceChildren(root,
    h('div', { class: 'search' },
      h('label', { for: 'atlas-search', class: 'field-label' }, 'Search'),
      search,
      h('span', { id: 'search-hint', class: 'hint' }, 'Press / to search')),
    h('fieldset', { class: 'chips' },
      h('legend', { class: 'field-label' }, 'Domain'),
      DOMAINS.map((d) => domainChip(d, dispatch))));
  return search;
}

export function syncIndexControls(root, state) {
  const search = root.querySelector('#atlas-search');
  if (search && search.value !== state.query) search.value = state.query;
  root.querySelectorAll('input[name="domain"]').forEach((input) => {
    input.checked = input.value === state.domain;
  });
}

function entry(item, selectedId, onSelect) {
  const kind = item.kind === 'paper' ? 'Paper' : 'Project';
  return h('li', { class: `entry-row entry-${item.kind}` },
    h('button', {
      type: 'button', class: 'entry', 'data-id': item.id,
      'aria-current': item.id === selectedId ? 'true' : false,
      onclick: () => onSelect(item.id),
    },
    h('span', { class: 'entry-index', 'aria-hidden': 'true' }, item.index),
    h('span', { class: 'entry-mark', 'aria-hidden': 'true' }),
    h('span', { class: 'entry-text' },
      h('span', { class: 'entry-title' }, item.title),
      h('span', { class: 'entry-kind' }, `${kind} / ${item.subtitle}`))));
}

function emptyState(dispatch) {
  return h('li', { class: 'entry-empty' },
    h('p', null, 'No entries match this search.'),
    h('button', { type: 'button', class: 'text-button', onclick: () => dispatch({ type: 'resetFilters' }) },
      'Clear search and filters'));
}

export function renderIndexList(list, { items, total, selectedId, onSelect, dispatch, status }) {
  replaceChildren(list, items.length ? items.map((item) => entry(item, selectedId, onSelect)) : emptyState(dispatch));
  status.textContent = `Showing ${items.length} of ${total} entries`;
}

export function syncIndexSelection(list, selectedId) {
  list.querySelectorAll('button.entry').forEach((button) => {
    if (button.dataset.id === selectedId) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
}
