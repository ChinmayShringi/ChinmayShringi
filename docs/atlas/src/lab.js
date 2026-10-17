// Illustrative routing lab. Deterministic rules only; no timing, cost or benchmark data.

import { h, s, replaceChildren } from './dom.js';
import { evaluateRouting } from './routing.js';
import { LAB_CAPABILITIES, LAB_DEVICES } from './content.js';

const ROUTER = { x: 250, y: 190 };
const DEVICE_X = 500;
const rowY = (i) => 66 + i * 82;

function capabilityChip(cap, dispatch) {
  const id = `cap-${cap.id}`;
  return h('span', { class: 'chip' },
    h('input', {
      type: 'radio', name: 'capability', id, value: cap.id,
      onchange: (event) => dispatch({ type: 'capability', value: event.target.value }),
    }),
    h('label', { for: id }, cap.label));
}

function controls(dispatch) {
  return h('div', { class: 'lab-controls' },
    h('fieldset', { class: 'chips' },
      h('legend', { class: 'field-label' }, 'Capability the task needs'),
      LAB_CAPABILITIES.map((cap) => capabilityChip(cap, dispatch))),
    h('label', { class: 'switch' },
      h('input', {
        type: 'checkbox', id: 'allow-remote', role: 'switch',
        onchange: (event) => dispatch({ type: 'allowRemote', value: event.target.checked }),
      }),
      h('span', { class: 'switch-track', 'aria-hidden': 'true' }),
      h('span', { class: 'switch-text' }, 'Allow remote execution')));
}

function deviceGroup(device, i) {
  const y = rowY(i);
  return s('g', { class: 'lab-device', 'data-id': device.id },
    s('path', { d: `M${ROUTER.x + 18} ${ROUTER.y}H380V${y}H${DEVICE_X}`, class: 'lab-path' }),
    s('path', { d: `M${ROUTER.x + 18} ${ROUTER.y}H380V${y}H${DEVICE_X}`, class: 'lab-flow' }),
    s('rect', { x: DEVICE_X, y: y - 26, width: 220, height: 52, class: 'lab-box' }),
    s('text', { x: DEVICE_X + 16, y: y - 3, class: 'lab-name' }, device.label.toUpperCase()),
    s('text', { x: DEVICE_X + 16, y: y + 16, class: 'lab-caps' }, device.capabilities.join(' / ').toUpperCase()),
    s('text', { x: DEVICE_X + 206, y: y - 3, class: 'lab-status' }, ''));
}

function diagram() {
  const localBottom = rowY(2) + 40;
  return s('svg', { viewBox: '0 0 760 380', class: 'lab-map', 'aria-hidden': 'true' },
    s('rect', { x: 470, y: 22, width: 274, height: localBottom - 22, class: 'lab-zone' }),
    s('text', { x: 482, y: 16, class: 'lab-zone-label' }, 'LOCAL'),
    s('line', { x1: 380, y1: localBottom + 8, x2: 744, y2: localBottom + 8, class: 'lab-gate-line' }),
    s('text', { x: 362, y: localBottom + 12, class: 'lab-zone-label lab-gate-label lab-anchor-end' }, 'POLICY GATE'),
    s('rect', { x: 372, y: localBottom - 2, width: 16, height: 20, class: 'lab-gate' }),
    s('text', { x: 482, y: 368, class: 'lab-zone-label' }, 'REMOTE'),
    s('path', { d: `M86 ${ROUTER.y}H${ROUTER.x - 18}`, class: 'lab-path lab-path-in' }),
    s('path', { d: `M86 ${ROUTER.y}H${ROUTER.x - 18}`, class: 'lab-flow lab-flow-in' }),
    LAB_DEVICES.map(deviceGroup),
    s('circle', { cx: 70, cy: ROUTER.y, r: 14, class: 'lab-request' }),
    s('text', { x: 70, y: ROUTER.y + 40, class: 'lab-label' }, 'TASK'),
    s('text', { x: 70, y: ROUTER.y + 60, class: 'lab-label lab-cap-label' }, ''),
    s('rect', { x: ROUTER.x - 18, y: ROUTER.y - 18, width: 36, height: 36, class: 'lab-router',
      transform: `rotate(45 ${ROUTER.x} ${ROUTER.y})` }),
    s('text', { x: ROUTER.x, y: ROUTER.y + 50, class: 'lab-label' }, 'ROUTER'));
}

export function createLab(root, dispatch) {
  const map = diagram();
  const verdict = h('p', { class: 'lab-verdict', role: 'status', 'aria-live': 'polite' });
  const candidates = h('ol', { class: 'lab-candidates' });
  replaceChildren(root,
    h('div', { class: 'lab-grid' },
      h('div', { class: 'lab-side' }, controls(dispatch), verdict),
      h('figure', { class: 'lab-figure' }, map,
        h('figcaption', { class: 'field-label' }, 'Illustrative sample devices. Not measured, not live.'))),
    h('h3', { class: 'field-label lab-candidates-title' }, 'Every candidate, with the reason'),
    candidates);
  return { map, verdict, candidates };
}

function statusFor(candidate, selectedId) {
  if (candidate.id === selectedId) return 'selected';
  return candidate.eligible ? 'eligible' : 'excluded';
}

function candidateRow(candidate, device, status) {
  return h('li', { class: `lab-candidate is-${status}` },
    h('span', { class: 'lab-candidate-name' }, device.label),
    h('span', { class: 'lab-candidate-where' }, device.local ? 'Local' : 'Remote'),
    h('span', { class: 'lab-candidate-status' }, status),
    h('span', { class: 'lab-candidate-reason' }, candidate.reason));
}

function syncControls(root, routing) {
  root.querySelectorAll('input[name="capability"]').forEach((input) => {
    input.checked = input.value === routing.capability;
  });
  root.querySelector('#allow-remote').checked = routing.allowRemote;
}

export function updateLab(root, parts, routing) {
  const result = evaluateRouting(routing, LAB_DEVICES);
  syncControls(root, routing);
  const cap = LAB_CAPABILITIES.find((c) => c.id === routing.capability);
  parts.map.querySelector('.lab-cap-label').textContent = (cap?.label ?? routing.capability).toUpperCase();
  parts.map.classList.toggle('is-gate-closed', !routing.allowRemote);
  parts.map.classList.toggle('is-unrouted', result.selectedId === null);
  result.candidates.forEach((candidate) => {
    const group = parts.map.querySelector(`.lab-device[data-id="${candidate.id}"]`);
    const status = statusFor(candidate, result.selectedId);
    group.setAttribute('class', `lab-device is-${status}`);
    group.querySelector('.lab-status').textContent = status === 'selected' ? 'ROUTED' : status === 'eligible' ? 'READY' : 'OUT';
  });
  const chosen = LAB_DEVICES.find((d) => d.id === result.selectedId);
  parts.verdict.textContent = chosen
    ? `Routed to ${chosen.label}. ${result.candidates.find((c) => c.id === chosen.id).reason}`
    : 'No eligible device. The task is held rather than sent somewhere unsuitable.';
  replaceChildren(parts.candidates, result.candidates.map((c, i) =>
    candidateRow(c, LAB_DEVICES[i], statusFor(c, result.selectedId))));
}
