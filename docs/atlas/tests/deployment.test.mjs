import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';

test('root deployment emits a self-contained static directory with identical serving rules', async () => {
  const repo = fileURLToPath(new URL('../../../', import.meta.url));
  const rootConfig = JSON.parse(await readFile(join(repo, 'vercel.json'), 'utf8'));
  await promisify(execFile)(process.execPath, ['docs/atlas/scripts/build.mjs'], { cwd: repo });

  const dist = join(repo, rootConfig.outputDirectory);
  const [staticConfig, homepage, contributions] = await Promise.all(
    ['vercel.json', 'index.html', 'contributions/index.html'].map((name) => readFile(join(dist, name), 'utf8')),
  );
  assert.deepEqual(JSON.parse(staticConfig), { cleanUrls: rootConfig.cleanUrls, headers: rootConfig.headers });
  assert.ok(homepage.includes('Chinmay Shringi'));
  assert.ok(contributions.includes('Open-source contributions'));
});
