import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { renderProfile } from '../scripts/profile.mjs';

const readme = await readFile(new URL('../../../README.md', import.meta.url), 'utf8');
const config = JSON.parse(await readFile(new URL('../../../vercel.json', import.meta.url), 'utf8'));
const template = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('renders all profile sections, nested project headings and code from the README', () => {
  const html = renderProfile(readme);
  for (const expected of ['whoami', 'Open-source contributions', 'GitHub Analytics', 'Featured Projects', 'Research publications', 'Signal Transmission']) {
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
  assert.ok(html.includes('media="screen" srcset="/readme/contribution-snake-dark.svg"'));
  assert.ok(html.includes('media="print" srcset="/readme/contribution-snake-light.svg"'));
  assert.ok(readme.includes('media="(prefers-color-scheme: light)"'));
  assert.match(html, /src="\/assets\/wave-hello.gif"/);
  assert.match(html, /href="mailto:cs7810@nyu.edu"/);
  assert.match(html, /href="https:\/\/github.com\/Lind-Project\/lind-wasm\/pull\/513"/);
  const example = renderProfile('<picture><source media="(min-width: 720px)" srcset="https://example.org/large.svg 2x, ./assets/test.png 1x"><img src="https://example.org/small.svg"></picture>');
  assert.match(example, /srcset="https:\/\/example.org\/large.svg 2x, \/assets\/test.png 1x"/);
});

test('GitHub uses repository artwork and a local section, while the website uses its public routes', () => {
  const html = renderProfile(readme);
  assert.ok(readme.includes('href="#user-content-open-source-contributions"'));
  assert.ok(readme.includes('## Open-source contributions'));
  assert.ok(html.includes('href="/contributions/">Open-source contributions</a>'));
  assert.ok(renderProfile('[Earlier link](#open-source-contributions)').includes('href="/contributions/"'));
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

test('publications navigation targets the rendered source section exactly once', () => {
  const html = renderProfile(readme);
  assert.ok(readme.includes('href="#user-content-research-publications"'));
  assert.ok(html.includes('href="#research-publications">Research publications</a>'));
  assert.ok(template.includes('href="/#research-publications"'));
  assert.equal(html.match(/id="research-publications"/g)?.length, 1);
  assert.match(html, /<h2 id="research-publications">Research publications<\/h2>/);
  assert.match(html, /<h3>Conference publications<\/h3>\s*<ul>/);
  assert.ok(html.includes('href="https://doi.org/10.1145/3786335.3813216"'));
  const sample = renderProfile('## Research publications\n\n[Example paper](https://example.org/paper)');
  assert.match(sample, /href="https:\/\/example.org\/paper">Example paper<\/a>/);
  assert.doesNotMatch(renderProfile('<h2 id="profile">Different title</h2>'), /id="profile"/);
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
