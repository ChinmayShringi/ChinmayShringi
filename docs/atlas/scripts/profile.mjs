import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const site = 'https://chinmay-systems-atlas.vercel.app';
const markdown = new Marked({ gfm: true }, {
  renderer: {
    heading({ depth, text, tokens }) {
      if (depth !== 2 || text !== 'Research publications') return false;
      return `<h2 id="research-publications">${this.parser.parseInline(tokens)}</h2>\n`;
    },
  },
});
// The hosted page has a fixed dark theme. Its printed artwork uses the light variant.
const siteMedia = new Map([
  ['(prefers-color-scheme: dark)', 'screen'],
  ['(prefers-color-scheme: light)', 'print'],
]);

function sitePath(value) {
  const section = value.replace(/^#user-content-/, '#');
  if (section === '#open-source-contributions') return '/contributions/';
  if (section === '#research-publications') return section;
  const relative = value.replace(/^\.\//, '');
  if (relative.startsWith('assets/')) return '/' + relative;
  if (relative.startsWith('docs/assets/')) return '/readme/' + relative.slice('docs/assets/'.length);
  if (value.startsWith(site + '/')) return value.slice(site.length);
  return value;
}

export function renderProfile(source) {
  return sanitizeHtml(markdown.parse(source), {
    allowedTags: [
      'a', 'b', 'blockquote', 'br', 'code', 'del', 'details', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'i', 'img', 'li', 'ol', 'p', 'picture', 'pre', 'source', 'strong', 'summary', 'table',
      'tbody', 'td', 'th', 'thead', 'tr', 'ul',
    ],
    allowedAttributes: {
      a: ['href', 'title'], br: ['clear'], code: ['class'], details: ['open'], div: ['align'],
      h2: [{ name: 'id', values: ['research-publications'] }],
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
        attribs: {
          ...a,
          ...(a.media && { media: siteMedia.get(a.media) ?? a.media }),
          srcset: (a.srcset ?? '').replace(/(^|,\s+)(\S+)/g, (_, separator, url) => separator + sitePath(url)),
        },
      }),
    },
  });
}
