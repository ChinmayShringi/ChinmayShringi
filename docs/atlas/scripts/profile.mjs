import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const site = 'https://chinmay-systems-atlas.vercel.app';

function sitePath(value) {
  if (value === '#open-source-contributions') return '/contributions/';
  const relative = value.replace(/^\.\//, '');
  if (relative.startsWith('assets/')) return '/' + relative;
  if (relative.startsWith('docs/assets/')) return '/readme/' + relative.slice('docs/assets/'.length);
  if (value.startsWith(site + '/')) return value.slice(site.length);
  return value;
}

export function renderProfile(markdown) {
  return sanitizeHtml(marked.parse(markdown, { gfm: true }), {
    allowedTags: [
      'a', 'b', 'blockquote', 'br', 'code', 'del', 'details', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'i', 'img', 'li', 'ol', 'p', 'picture', 'pre', 'source', 'strong', 'summary', 'table',
      'tbody', 'td', 'th', 'thead', 'tr', 'ul',
    ],
    allowedAttributes: {
      a: ['href', 'title'], br: ['clear'], code: ['class'], details: ['open'], div: ['align'],
      img: ['src', 'alt', 'title', 'width', 'height', 'align'], ol: ['start'], p: ['align'],
      source: ['srcset', 'media', 'type'], td: ['width', 'align', 'colspan', 'rowspan'], th: ['align', 'scope'],
    },
    allowedClasses: { code: ['language-*'] },
    allowedSchemes: ['https', 'mailto'],
    allowedSchemesByTag: { img: ['https'], source: ['https'] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, a) => ({ tagName, attribs: { ...a, href: sitePath(a.href ?? '') } }),
      img: (tagName, a) => ({ tagName, attribs: { ...a, src: sitePath(a.src ?? '') } }),
      source: (tagName, a) => ({
        tagName,
        attribs: { ...a, srcset: (a.srcset ?? '').replace(/(^|,\s+)(\S+)/g, (_, separator, url) => separator + sitePath(url)) },
      }),
    },
  });
}
