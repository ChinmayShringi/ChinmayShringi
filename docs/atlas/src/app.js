// Bootstrap: wires the immutable store to the index, map, inspector, lab and palette.

import { ITEMS } from './content.js';
import { filterItems, parseSelectionHash, selectionHash } from './model.js';
import { createInitialState, createStore } from './state.js';
import { createAtlas, updateAtlas } from './atlas.js';
import { createIndexControls, renderIndexList, syncIndexControls, syncIndexSelection } from './index-list.js';
import { renderInspector } from './inspector.js';
import { createLab, updateLab } from './lab.js';
import { buildCommands } from './commands.js';
import { createPalette } from './palette.js';
import {
  applyPreferences, loadPreferences, savePreferences, syncPreferenceControls, wirePreferenceControls,
} from './preferences.js';
import { prefersReducedMotion } from './dom.js';

const DEFAULT_ID = 'graft';
const $ = (selector) => document.querySelector(selector);

const store = createStore(createInitialState({
  ...loadPreferences(),
  selectedId: parseSelectionHash(window.location.hash, ITEMS) ?? DEFAULT_ID,
}));

const isStacked = () => window.matchMedia('(max-width: 1180px)').matches;
const motionAllowed = () => store.getState().motion !== 'off' && !prefersReducedMotion();
const scrollBehavior = () => (motionAllowed() ? 'smooth' : 'auto');

function focusInspector() {
  const heading = $('#inspector-title');
  if (!heading) return;
  const inspector = $('#inspector');
  inspector.scrollTop = 0;
  heading.focus({ preventScroll: true });
  inspector.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
}

function select(id, { focus = false } = {}) {
  if (id !== store.getState().selectedId) {
    store.dispatch({ type: 'select', id });
  }
  const hash = selectionHash(id);
  if (window.location.hash !== hash) window.history.pushState(null, '', hash);
  if (focus || isStacked()) focusInspector();
}

function goto(target) {
  const section = document.getElementById(target);
  if (!section) return;
  section.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  section.querySelector('h2')?.focus({ preventScroll: true });
}

function execute(action) {
  if (action.type === 'select') select(action.id, { focus: true });
  else if (action.type === 'goto') goto(action.target);
  else store.dispatch(action);
}

function restoreFromLocation(event) {
  const hash = window.location.hash;
  const projectId = parseSelectionHash(hash, ITEMS);
  const id = projectId ?? (hash === '' ? DEFAULT_ID : null);
  if (id === null) return;
  if (id !== store.getState().selectedId) store.dispatch({ type: 'select', id });
  if (event.type === 'hashchange' && projectId !== null) focusInspector();
}

function observeMasthead() {
  const masthead = $('.masthead');
  const measure = () => {
    document.documentElement.style.setProperty('--masthead-h', `${Math.ceil(masthead.getBoundingClientRect().height)}px`);
  };
  measure();
  const observer = new ResizeObserver(measure);
  observer.observe(masthead);
}

function wireProjectLinks() {
  document.querySelectorAll('a[href^="#project/"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const id = parseSelectionHash(link.hash, ITEMS);
      if (id === null) return;
      event.preventDefault();
      select(id, { focus: true });
    });
  });
}

function renderIndex(state) {
  const items = filterItems(ITEMS, state);
  renderIndexList($('#index-list'), {
    items, total: ITEMS.length, selectedId: state.selectedId, onSelect: select, dispatch: store.dispatch,
    status: $('#index-status'),
  });
  syncIndexControls($('#index-controls'), state);
}

function renderSelection(view, state) {
  updateAtlas(view.map, {
    selectedId: state.selectedId,
    visibleIds: filterItems(ITEMS, state).map((item) => item.id),
  });
  syncIndexSelection($('#index-list'), state.selectedId);
}

function renderPreferences(state, prev) {
  if (changed(state, prev, ['theme', 'motion'])) {
    applyPreferences(state);
    syncPreferenceControls(state);
    if (prev) savePreferences(state);
  }
}

function mount() {
  const dispatch = store.dispatch;
  observeMasthead();
  createIndexControls($('#index-controls'), dispatch);
  const map = createAtlas({ onSelect: (id) => select(id) });
  $('#atlas-plate').replaceChildren(map);
  const lab = createLab($('#lab-root'), dispatch);
  wirePreferenceControls(dispatch);
  const openPalette = createPalette({ dialog: $('#palette'), commands: buildCommands(ITEMS), execute });
  $('#palette-open').addEventListener('click', openPalette);
  wireKeys(openPalette);
  wireProjectLinks();
  window.addEventListener('popstate', restoreFromLocation);
  window.addEventListener('hashchange', restoreFromLocation);
  return { map, lab };
}

function isTyping(target) {
  return target.closest('input, textarea, select, [contenteditable="true"]') !== null;
}

function wireKeys(openPalette) {
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (!$('#palette').open) openPalette();
    } else if (event.key === '/' && !isTyping(event.target) && !$('#palette').open) {
      event.preventDefault();
      $('#atlas-search').focus();
    }
  });
}

function changed(state, prev, keys) {
  return !prev || keys.some((key) => state[key] !== prev[key]);
}

function render(view, state, prev) {
  if (changed(state, prev, ['query', 'domain'])) renderIndex(state);
  if (changed(state, prev, ['query', 'domain', 'selectedId'])) {
    renderSelection(view, state);
  }
  if (changed(state, prev, ['selectedId'])) renderInspector($('#inspector'), state.selectedId, (id, opts) => select(id, opts));
  if (changed(state, prev, ['routing'])) updateLab($('#lab-root'), view.lab, state.routing);
  renderPreferences(state, prev);
}

const view = mount();
render(view, store.getState(), null);
store.subscribe((state, prev) => render(view, state, prev));
