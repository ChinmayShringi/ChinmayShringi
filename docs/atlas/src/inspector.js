// The inspector: a specimen sheet for the selected entry.

import { h, replaceChildren } from './dom.js';
import { getItem, selectionHash } from './model.js';
import { ITEMS, relationsFor } from './content.js';

function section(title, ...children) {
  return h('section', { class: 'sheet-section' }, h('h3', { class: 'field-label' }, title), ...children);
}

function architecture(item) {
  if (item.architecture.length === 0) return null;
  return section(item.kind === 'paper' ? 'Core idea' : 'How it is built',
    h('ol', { class: 'route-steps' },
      item.architecture.map((step, i) => h('li', { class: 'route-step' },
        h('span', { class: 'step-num', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')),
        h('span', { class: 'step-label' }, step.label),
        h('span', { class: 'step-note' }, step.note)))));
}

function related(item, onSelect) {
  const links = relationsFor(item.id);
  if (links.length === 0) return null;
  return section('Connected ideas',
    h('ul', { class: 'related' },
      links.map(({ id, label }) => {
        const other = getItem(ITEMS, id);
        return h('li', null,
          h('button', { type: 'button', class: 'related-button', onclick: () => onSelect(id, { focus: true }) },
            h('span', { class: 'related-label' }, label),
            h('span', { class: 'related-target' }, `${other.index} ${other.title}`)));
      })));
}

async function copyLink(button, id) {
  try {
    const url = new URL(selectionHash(id), window.location.href);
    await navigator.clipboard.writeText(url.href);
    button.textContent = 'Link copied';
  } catch {
    button.textContent = 'Copy unavailable: use the address bar';
  }
}

function header(item) {
  const kind = item.kind === 'paper' ? 'Paper' : 'Project';
  return h('header', { class: 'sheet-header' },
    h('p', { class: 'field-label' }, `Entry ${item.index} / ${kind} / ${item.subtitle}`),
    h('span', { class: 'sheet-numeral', 'aria-hidden': 'true' }, item.index),
    h('h2', { id: 'inspector-title', class: 'sheet-title', tabindex: '-1' }, item.title),
    item.fullTitle ? h('p', { class: 'sheet-fulltitle' }, item.fullTitle) : null,
    item.authors ? h('p', { class: 'sheet-authors' }, item.authors) : null);
}

function sources(item) {
  const copy = h('button', { type: 'button', class: 'text-button copy-link', onclick: (e) => copyLink(e.currentTarget, item.id) },
    'Copy link to this entry');
  return section('Sources',
    h('ul', { class: 'source-links' },
      item.links.map((link) => h('li', null, h('a', { href: link.href, class: 'out-link' }, link.label)))),
    copy);
}

export function renderInspector(root, selectedId, onSelect) {
  root.scrollTop = 0;
  const item = getItem(ITEMS, selectedId);
  if (!item) {
    replaceChildren(root, h('p', { class: 'sheet-empty' }, 'Select an entry to inspect it.'));
    return;
  }
  replaceChildren(root,
    h('article', { class: `sheet sheet-${item.kind}`, 'aria-labelledby': 'inspector-title' },
      header(item),
      h('p', { class: 'sheet-summary' }, item.summary),
      h('p', { class: 'sheet-detail' }, item.detail),
      architecture(item),
      section('Stack and themes', h('p', { class: 'stack' }, item.technologies.join('  /  '))),
      sources(item),
      related(item, onSelect)));
}
