// Theme and motion preferences: persisted per viewer, applied as root data attributes.

import { THEMES, MOTIONS } from './state.js';

const KEY = 'systems-atlas:prefs';

export function loadPreferences() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    return {
      theme: THEMES.includes(raw.theme) ? raw.theme : 'system',
      motion: MOTIONS.includes(raw.motion) ? raw.motion : 'auto',
    };
  } catch {
    return { theme: 'system', motion: 'auto' };
  }
}

export function savePreferences({ theme, motion }) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ theme, motion }));
  } catch {
    // Storage can be unavailable (private mode, blocked site data); preferences then last for this visit.
  }
}

export function applyPreferences({ theme, motion }) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.motion = motion;
}

export function syncPreferenceControls(state) {
  document.querySelectorAll('input[name="theme"]').forEach((input) => {
    input.checked = input.value === state.theme;
  });
  document.querySelectorAll('input[name="motion"]').forEach((input) => {
    input.checked = input.value === state.motion;
  });
}

export function wirePreferenceControls(dispatch) {
  document.querySelectorAll('input[name="theme"], input[name="motion"]').forEach((input) => {
    input.addEventListener('change', () => dispatch({ type: input.name, value: input.value }));
  });
}
