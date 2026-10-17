// Pure command catalog for the command palette. Execution lives in app.js.

export function buildCommands(items) {
  const entries = items.map((item) => ({
    id: `open:${item.id}`,
    group: item.kind === 'paper' ? 'Papers' : 'Projects',
    label: `${item.index}  ${item.title}`,
    keywords: `${item.title} ${item.fullTitle ?? ''} ${item.subtitle} ${item.technologies.join(' ')}`,
    action: { type: 'select', id: item.id },
  }));
  const views = [
    ['Go to the atlas', 'atlas'],
    ['Go to the routing lab', 'lab'],
    ['Go to research', 'research'],
    ['Go to contact', 'contact'],
  ].map(([label, target]) => ({
    id: `goto:${target}`, group: 'Sections', label, keywords: target, action: { type: 'goto', target },
  }));
  const prefs = [
    ['Theme: follow system', 'theme', 'system'],
    ['Theme: light', 'theme', 'light'],
    ['Theme: dark', 'theme', 'dark'],
    ['Motion: automatic', 'motion', 'auto'],
    ['Motion: off', 'motion', 'off'],
  ].map(([label, type, value]) => ({
    id: `${type}:${value}`, group: 'Preferences', label, keywords: type, action: { type, value },
  }));
  return Object.freeze([...entries, ...views, ...prefs].map(Object.freeze));
}

export function filterCommands(commands, query) {
  const terms = String(query).trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...commands];
  return commands.filter((command) => {
    const haystack = `${command.label} ${command.group} ${command.keywords}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
