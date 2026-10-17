// Minimal DOM builders. Text is always set via text nodes, never parsed as HTML.

const SVG_NS = 'http://www.w3.org/2000/svg';

function apply(el, attrs) {
  Object.entries(attrs ?? {}).forEach(([key, value]) => {
    if (value === false || value === null || value === undefined) return;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value === true ? '' : String(value));
    }
  });
  return el;
}

function append(el, children) {
  [children].flat(Infinity).forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    el.append(typeof child === 'string' || typeof child === 'number' ? String(child) : child);
  });
  return el;
}

export function h(tag, attrs, ...children) {
  return append(apply(document.createElement(tag), attrs), children);
}

export function s(tag, attrs, ...children) {
  return append(apply(document.createElementNS(SVG_NS, tag), attrs), children);
}

export function replaceChildren(el, ...children) {
  el.replaceChildren();
  return append(el, children);
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
