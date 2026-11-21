import { renderProfile } from './profile.mjs';

const START = '<!-- public-contributions:start -->';
const END = '<!-- public-contributions:end -->';

export function renderContributions(readme) {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start < 0 || end < start || start !== readme.lastIndexOf(START) || end !== readme.lastIndexOf(END)) {
    throw new Error('Expected one ordered pair of public-contributions markers in the profile README');
  }
  const section = readme.slice(start + START.length, end).trim();
  if (!/^## \S/.test(section)) throw new Error('Expected a level-two heading at the start of the contribution directory');
  return renderProfile(section.slice(1));
}
