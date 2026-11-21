import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { renderContributions } from '../scripts/contributions.mjs';

const start = '<!-- public-contributions:start -->';
const end = '<!-- public-contributions:end -->';
const section = (body) => `outside the directory\n${start}\n## Open-source contributions\n\n${body}\n${end}\nprivate draft`;

test('builds only the marked source, with a main heading, native disclosures and semantic tables', () => {
  const html = renderContributions(section([
    '<details>', '<summary>Peer review</summary>', '',
    '| Repo | Work |', '| --- | --- |', '| [Example](https://example.com/project) | Review |',
    '', '</details>',
  ].join('\n')));
  for (const text of ['<h1>Open-source contributions</h1>', '<details>', '<summary>Peer review</summary>', '<table>', '<th>Repo</th>', '<a href="https://example.com/project">Example</a>']) {
    assert.ok(html.includes(text), text);
  }
  assert.doesNotMatch(html, /outside the directory|private draft/);
});

test('fails the build for missing, duplicate or reversed bounds and missing title', () => {
  for (const invalid of ['', start, end + start, section('test') + start, end + section('test')]) {
    assert.throws(() => renderContributions(invalid), /markers/);
  }
  assert.throws(() => renderContributions(start + 'plain content' + end), /heading/);
});

test('the directory shares the profile formatting and sanitization policy', () => {
  const html = renderContributions(section('<b>Review notes</b>\n\n[Source](https://example.org)\n\n<script>bad()</script>'));
  assert.match(html, /<b>Review notes<\/b>/);
  assert.match(html, /href="https:\/\/example.org"/);
  assert.doesNotMatch(html, /<script>|bad\(\)/);
});

test('the public README contributes a directory with its own heading', async () => {
  const readme = await readFile(new URL('../../../README.md', import.meta.url), 'utf8');
  assert.match(renderContributions(readme), /<h1>Open-source contributions<\/h1>/);
});
