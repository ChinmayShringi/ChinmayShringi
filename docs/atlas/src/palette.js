// Command palette on a native modal <dialog>: Escape closes, focus returns to the opener.

import { h, replaceChildren } from './dom.js';
import { filterCommands } from './commands.js';

function option(command, active, run) {
  return h('li', {
    id: `cmd-${command.id.replace(/[^a-z0-9-]/gi, '-')}`,
    role: 'option', class: 'palette-option', 'aria-selected': active ? 'true' : 'false',
    onclick: () => run(command),
  },
  h('span', { class: 'palette-group' }, command.group),
  h('span', { class: 'palette-label' }, command.label));
}

function render(view, results, active, run) {
  replaceChildren(view.list, results.length
    ? results.map((c, i) => option(c, i === active, run))
    : h('li', { class: 'palette-empty', role: 'presentation' }, 'No matching command'));
  const current = view.list.children[active];
  if (results.length && current) {
    view.input.setAttribute('aria-activedescendant', current.id);
    current.scrollIntoView({ block: 'nearest' });
  } else {
    view.input.removeAttribute('aria-activedescendant');
  }
}

function keyStep(key) {
  return { ArrowDown: 1, ArrowUp: -1 }[key] ?? 0;
}

export function createPalette({ dialog, commands, execute }) {
  const view = { input: dialog.querySelector('#palette-input'), list: dialog.querySelector('#palette-list') };
  let results = [...commands];
  let active = 0;
  const run = (command) => {
    dialog.close();
    execute(command.action);
  };
  const refresh = () => render(view, results, active, run);

  view.input.addEventListener('input', () => {
    results = filterCommands(commands, view.input.value);
    active = 0;
    refresh();
  });
  view.input.addEventListener('keydown', (event) => {
    const step = keyStep(event.key);
    if (step && results.length) {
      event.preventDefault();
      active = (active + step + results.length) % results.length;
      refresh();
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      run(results[active]);
    }
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  return function open() {
    view.input.value = '';
    results = [...commands];
    active = 0;
    refresh();
    dialog.showModal();
    view.input.focus();
  };
}
