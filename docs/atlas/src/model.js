// Pure, immutable helpers for filtering atlas entries and encoding selection hashes.

const HASH_PREFIX = '#project/';

function searchableText(item) {
  return [item.title, item.fullTitle, item.summary, ...(item.technologies ?? []), ...(item.domains ?? [])]
    .join('\n')
    .toLowerCase();
}

function matchesDomain(item, domain) {
  return domain === 'all' || (item.domains ?? []).includes(domain);
}

export function filterItems(items, { query = '', domain = 'all' } = {}) {
  const needle = String(query).trim().toLowerCase();
  return items.filter(
    (item) => matchesDomain(item, domain) && (needle === '' || searchableText(item).includes(needle)),
  );
}

export function getItem(items, id) {
  return items.find((item) => item.id === id) ?? null;
}

export function selectionHash(id) {
  return `${HASH_PREFIX}${encodeURIComponent(id)}`;
}

function safeDecode(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

export function parseSelectionHash(hash, items) {
  if (typeof hash !== 'string' || !hash.startsWith(HASH_PREFIX)) return null;
  const segment = hash.slice(HASH_PREFIX.length);
  if (segment === '' || segment.includes('/')) return null;
  const id = safeDecode(segment);
  return id !== null && getItem(items, id) ? id : null;
}
