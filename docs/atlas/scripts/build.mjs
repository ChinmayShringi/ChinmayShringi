#!/usr/bin/env node
// Builds docs/atlas/dist: only the public runtime files, plus README artwork under /readme/.
// Usage: node scripts/build.mjs   (or: npm run build)

import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const README_ART = join(ROOT, '..', 'assets');
const RUNTIME = Object.freeze(['index.html', 'vercel.json', 'assets', 'styles', 'src']);

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  }));
  return nested.flat();
}

async function copyRuntime() {
  await Promise.all(RUNTIME.map((name) => cp(join(ROOT, name), join(DIST, name), { recursive: true })));
}

async function copyReadmeArt() {
  const svgs = (await readdir(README_ART)).filter((name) => name.endsWith('.svg'));
  if (svgs.length === 0) throw new Error(`No README SVG artwork found in ${README_ART}`);
  await mkdir(join(DIST, 'readme'), { recursive: true });
  await Promise.all(svgs.map((name) => cp(join(README_ART, name), join(DIST, 'readme', name))));
  return svgs;
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  await copyRuntime();
  const art = await copyReadmeArt();
  const files = await listFiles(DIST);
  const sizes = await Promise.all(files.map((file) => stat(file).then((s) => s.size)));
  const total = sizes.reduce((sum, size) => sum + size, 0);
  process.stdout.write(`Built ${files.length} files (${(total / 1024).toFixed(1)} KiB) into ${relative(process.cwd(), DIST) || '.'}\n`);
  process.stdout.write(`README artwork: ${art.length} SVGs under /readme/\n`);
}

main().catch((error) => {
  process.stderr.write(`Build failed: ${error.message}\n`);
  process.exitCode = 1;
});
