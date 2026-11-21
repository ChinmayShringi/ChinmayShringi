# Profile README maintenance

## Profile images and contribution directory

The GitHub README loads its activity cards from `docs/assets/` and its GIFs from `assets/`. The website serves the same cards under `/readme/`. Both cards include the date of the snapshot. Refresh them from the repository root with GitHub CLI signed in.

```bash
python3 docs/assets/build_github_stats.py
python3 -m unittest discover -s docs/assets -p 'test_*.py'
```

The language chart counts the primary language of each public, non-fork repository owned by the account. The peer review count is the number of distinct PRs reviewed in other owners' public repositories, excluding the account owner's own PRs.

To refresh the two snake images, check out [Platane/snk v3.5.0](https://github.com/Platane/snk/tree/d8f6715049803e982ee5ff501b6b9b7d5deeb09b), run `bun install --frozen-lockfile --ignore-scripts` in that checkout, and pass its directory to `bun docs/assets/build_snake.mjs /path/to/snk` from this repository. The script checks the generator revision and reads the public contribution calendar without credentials.

Edit the project directory between the `public-contributions:start` and `public-contributions:end` HTML comments in the root README. The site build also publishes this section at `/contributions`. Refresh the dated totals when updating the directory, rebuild the site, and check the four images and the directory on the public deployment.

## Build and publish the Markdown profile

The root README supplies the home page and the contribution directory. The build in `docs/atlas/` converts it to static HTML, filters rendered markup and copies the repository's public images. Existing artwork URLs remain available under `/readme/`.

Use Node 24 or later. From `docs/atlas/`, run:

```bash
npm ci --ignore-scripts
npm test
npm run build
```

The root `vercel.json` configures the existing `chinmay-systems-atlas` project to build the site from this repository. Use the repository root as Vercel’s Root Directory. For a manual deployment to the same project, upload the contents of `docs/atlas/dist/`, including its generated `vercel.json`. [Live profile](https://chinmay-systems-atlas.vercel.app/) · [Project dashboard](https://vercel.com/chinmayshringis-projects/chinmay-systems-atlas)

After deployment, open the homepage and contribution directory, expand the project lists and check the local and external images in light and dark modes. When adding a new external image service to the README, update the image host allowlist in the root `vercel.json` so browsers can load it. If updating an image at an existing URL, use a new cache key in the README image URL to refresh GitHub's image proxy.

## Content sources

Keep facts in the README tied to public sources:

- Portfolio: https://chinmayshringi.web.app/
- LinkedIn: https://www.linkedin.com/in/chinmay-shringi/
- ORCID: https://orcid.org/0009-0008-0325-7668
- Writing: https://medium.com/@chinmayshringi4
- GRAFT (ACM CAIS 2026): https://doi.org/10.1145/3786335.3813216 and https://openreview.net/pdf?id=AHUfHheG4V
- Branch-Commit-Validate (Springer CCIS 2937): https://doi.org/10.1007/978-3-032-22208-4_37
- An Advanced AI-Driven Database System (EDULEARN25): https://library.iated.org/view/TEDESCHI2025ANA
- Spotlight Security Benchmark: https://www.benchmark-spotlightsecurity.com/
- Projects: each project's public repository README under https://github.com/ChinmayShringi

Do not add numbers, scores, awards or "current" roles unless a public source supports them.
