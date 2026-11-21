// Run with Bun and a checkout of Platane/snk v3.5.0 with its workspaces installed.
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeFile } from 'node:fs/promises';

const REVISION = 'd8f6715049803e982ee5ff501b6b9b7d5deeb09b';
const CALENDAR = 'https://github.com/users/ChinmayShringi/contributions';
const OUTPUT = dirname(fileURLToPath(import.meta.url));

if (!process.argv[2]) throw new Error('Pass a local checkout of Platane/snk v3.5.0.');
const source = resolve(process.argv[2]);
const revision = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (revision !== REVISION) throw new Error(`Expected Platane/snk at ${REVISION}.`);
const packages = join(source, 'packages');
const load = path => import(pathToFileURL(join(packages, path)).href);
const [{ cellsToGrid }, { getBestRoute }, { getPathToPose }, { createSvg }, { snake4 }, { parseEntry }] =
  await Promise.all([
    'generate-snake-animation/cellsToGrid.ts', 'solver/getBestRoute.ts', 'solver/getPathToPose.ts',
    'svg-creator/index.ts', 'types/__fixtures__/snake.ts', 'generate-snake-animation/outputsOptions.ts',
  ].map(load));

const response = await fetch(CALENDAR);
if (!response.ok) throw new Error(`Could not read the public calendar (HTTP ${response.status}).`);
let cells = [];
await new HTMLRewriter().on('td.ContributionCalendar-day[data-date][data-level][data-ix]', {
  element(element) {
    const date = element.getAttribute('data-date');
    const x = Number(element.getAttribute('data-ix'));
    const y = new Date(date + 'T00:00:00Z').getUTCDay();
    const level = Number(element.getAttribute('data-level'));
    if (!Number.isInteger(x) || x < 0 || !Number.isInteger(y) || ![0, 1, 2, 3, 4].includes(level)) {
      throw new Error(`Invalid public calendar cell on ${date}.`);
    }
    cells = [...cells, { date, x, y, level }];
  },
}).transform(response).text();
if (cells.length < 365 || new Set(cells.map(c => c.date)).size !== cells.length) {
  throw new Error('The public calendar is incomplete or contains duplicate dates.');
}
const days = cells.toSorted((a, b) => a.date.localeCompare(b.date));
const grid = cellsToGrid(days);
const route = getBestRoute(grid, snake4);
const loop = [...route, ...getPathToPose(route.at(-1), snake4)];
const dates = `${days[0].date} to ${days.at(-1).date}`;
for (const [theme, snake] of [['light', '652d90'], ['dark', 'e6aaff']]) {
  const output = parseEntry(`snake.svg?palette=github-${theme}&color_snake=%23${snake}`);
  const svg = createSvg(grid, days, loop, output.drawOptions, output.animationOptions)
    .replace('<desc>', `<title>ChinmayShringi's GitHub contribution calendar</title><desc>Public calendar from ${dates}. `)
    .replace('</style>', '@media(prefers-reduced-motion:reduce){rect{animation:none!important}}</style>');
  await writeFile(join(OUTPUT, `contribution-snake-${theme}.svg`), svg + '\n');
}
