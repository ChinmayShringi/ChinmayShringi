#!/usr/bin/env node
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { renderContributions } from './contributions.mjs';
import { renderProfile } from './profile.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REPO = join(ROOT, '..', '..');
const DIST = join(ROOT, 'dist');

async function copyImages(source, target, extensions) {
  const images = (await readdir(source, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && extensions.test(entry.name));
  await mkdir(target, { recursive: true });
  await Promise.all(images.map(({ name }) => cp(join(source, name), join(target, name))));
}

async function main() {
  const [readme, template, vercel] = await Promise.all([
    readFile(join(REPO, 'README.md'), 'utf8'), readFile(join(ROOT, 'index.html'), 'utf8'),
    readFile(join(REPO, 'vercel.json'), 'utf8').then(JSON.parse),
  ]);
  const page = (title, html) => template
    .replace('<!-- page-title -->', () => title)
    .replace('<!-- profile-content -->', () => html);
  const profile = renderProfile(readme);
  const title = profile.includes('<h1>') ? '' : '<h1 class="visually-hidden">Chinmay Shringi</h1>';
  const home = page('Chinmay Shringi', title + profile);
  const directory = page('Open-source contributions / Chinmay Shringi', renderContributions(readme));
  await rm(DIST, { recursive: true, force: true });
  await mkdir(join(DIST, 'contributions'), { recursive: true });
  await Promise.all([
    writeFile(join(DIST, 'index.html'), home),
    writeFile(join(DIST, 'contributions', 'index.html'), directory),
    cp(join(ROOT, 'styles', 'profile.css'), join(DIST, 'profile.css')),
    // Direct uploads of dist/ need the same routing and headers, without a second build.
    writeFile(join(DIST, 'vercel.json'), JSON.stringify({ cleanUrls: vercel.cleanUrls, headers: vercel.headers }, null, 2) + '\n'),
    copyImages(join(REPO, 'assets'), join(DIST, 'assets'), /\.(gif|png|webp|jpe?g|svg)$/i),
    copyImages(join(REPO, 'docs', 'assets'), join(DIST, 'readme'), /\.svg$/i),
  ]);
  console.log('Built the profile, contribution directory and public artwork in dist/');
}

main().catch((error) => {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
});
