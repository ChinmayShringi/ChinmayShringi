import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { renderProfile } from '../scripts/profile.mjs';

const readme = await readFile(new URL('../../../README.md', import.meta.url), 'utf8');
const config = JSON.parse(await readFile(new URL('../../../vercel.json', import.meta.url), 'utf8'));

test('renders all profile sections, nested project headings and code from the README', () => {
  const html = renderProfile(readme);
  for (const expected of ['whoami', 'Open-source contributions', 'GitHub Analytics', 'Featured Projects', 'Research &amp; Publications', 'Signal Transmission']) {
    assert.ok(html.includes(expected), expected);
  }
  assert.match(html, /<h3>[^<]*Lind Virtual Machine<\/h3>/u);
  assert.match(html, /<h3>[^<]*CRPC Consensus Protocol<\/h3>/u);
  assert.match(html, /<code class="language-typescript">/);
  assert.ok(html.includes('<li>POSIX-compliant syscalls with memory safety</li>'));
  assert.match(html, /<blockquote>/);
  assert.match(html, /<details>/);
  assert.doesNotMatch(html, /<!-- public-contributions|<script|<iframe/i);
});

test('keeps theme pictures, relative assets, public evidence and email links', () => {
  const html = renderProfile(readme);
  assert.match(html, /<picture>[\s\S]*?srcset="\/readme\/contribution-snake-dark.svg"/);
  assert.match(html, /src="\/assets\/wave-hello.gif"/);
  assert.match(html, /href="mailto:cs7810@nyu.edu"/);
  assert.match(html, /href="https:\/\/github.com\/Lind-Project\/lind-wasm\/pull\/513"/);
  const example = renderProfile('<picture><source media="(min-width: 720px)" srcset="https://example.org/large.svg 2x, ./assets/test.png 1x"><img src="https://example.org/small.svg"></picture>');
  assert.match(example, /srcset="https:\/\/example.org\/large.svg 2x, \/assets\/test.png 1x"/);
});

test('GitHub uses repository artwork and a local section, while the website uses its public routes', () => {
  const html = renderProfile(readme);
  assert.ok(readme.includes('href="#open-source-contributions"'));
  assert.ok(readme.includes('## Open-source contributions'));
  assert.ok(html.includes('href="/contributions/"'));
  for (const file of ['github-stats.svg', 'top-languages.svg', 'contribution-snake-light.svg', 'contribution-snake-dark.svg']) {
    assert.ok(readme.includes(`="./docs/assets/${file}"`), file);
    assert.ok(html.includes(`="/readme/${file}"`), file);
  }
  assert.ok(!readme.includes('chinmay-systems-atlas.vercel.app/readme/'));
  assert.ok(!html.includes('./docs/assets/'));
});

test('filters active markup and undeclared attributes from public Markdown', () => {
  const html = renderProfile('<div align="center" onclick="ignore()"><script>unwanted text</script><a href="javascript:ignore()">Text</a><img src="./assets/one.png" onerror="ignore()"></div>');
  assert.match(html, /align="center"/);
  assert.match(html, /src="\/assets\/one.png"/);
  assert.doesNotMatch(html, /unwanted text|ignore\(|javascript:|onclick|onerror|<script/i);
});

test('every remote README image origin is allowed by the site policy', () => {
  const policy = config.headers[0].headers.find((entry) => entry.key === 'Content-Security-Policy').value;
  const sources = policy.match(/img-src ([^;]+)/)[1].split(' ');
  assert.ok(!sources.includes('https:') && !sources.includes('*'));
  const html = renderProfile(readme);
  for (const [, url] of html.matchAll(/(?:src|srcset)="(https:\/\/[^" ]+)/g)) {
    assert.ok(sources.includes(new URL(url).origin), url);
  }
});
