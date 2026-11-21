"""Refresh the two public GitHub profile cards with an authenticated GitHub CLI."""

from collections import Counter
from datetime import datetime, timezone
from html import escape
import json
from pathlib import Path
import subprocess

from build_assets import svg


ACCOUNT = "ChinmayShringi"
OUT = Path(__file__).resolve().parent
WIDTH = 370
HEIGHT = 206
COLORS = ("#56a8ff", "#64d9d0", "#ffda72", "#bb9bfa", "#ff8ba7")


def github(*args):
    result = subprocess.run(["gh", "api", *args], capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def match_count(query):
    result = github("--method", "GET", "search/issues", "-f", "q=" + query, "-F", "per_page=1")
    if result["incomplete_results"]:
        raise RuntimeError("GitHub returned an incomplete count for " + query)
    return result["total_count"]


def card(title, description, footer, body):
    frame = f'<rect x="1" y="1" width="{WIDTH - 2}" height="{HEIGHT - 2}" rx="12" fill="#0d1117" stroke="#30363d"/>'
    content = f"""<g font-family="Inter, system-ui, sans-serif">
    <text x="20" y="34" font-size="19" font-weight="700" fill="#ff8ba7">{escape(title)}</text>
    {body}
    <text x="20" y="189" font-size="11" fill="#adb6c2">{escape(footer)}</text>
  </g>"""
    return svg(WIDTH, HEIGHT, escape(title), escape(description), frame + content)


def stats_card(counts, as_of):
    rows = []
    for index, (label, count) in enumerate(counts):
        y = 67 + 26 * index
        rows.append(f'<text x="20" y="{y}" fill="#e6edf3" font-size="14">{escape(label)}</text>')
        rows.append(f'<text x="350" y="{y}" text-anchor="end" fill="#ffda72" font-size="16" font-weight="600">{count:,}</text>')
    description = ", ".join(f"{label} {count}" for label, count in counts)
    return card("Public GitHub activity", description, "GitHub public records · " + as_of, "\n".join(rows))


def language_card(repositories, as_of):
    counts = Counter(repo["language"] for repo in repositories if not repo["fork"] and repo["language"])
    leaders = sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:len(COLORS)]
    rows = []
    for index, (language, count) in enumerate(leaders):
        y = 58 + 23 * index
        rows.append(f'<text x="20" y="{y}" fill="#e6edf3" font-size="13">{escape(language)}</text>')
        rows.append(f'<rect x="135" y="{y - 8}" width="{165 * count / leaders[0][1]:.1f}" height="6" rx="3" fill="{COLORS[index]}"/>')
        rows.append(f'<text x="350" y="{y}" text-anchor="end" fill="#e6edf3" font-size="14">{count}</text>')
    description = "Primary languages by number of public, non-fork repositories. " + ", ".join(
        f"{language} {count}" for language, count in leaders
    )
    return card("Top repository languages", description, "Public non-fork repos · " + as_of, "\n".join(rows))


def main():
    pages = github("--paginate", "--slurp", f"users/{ACCOUNT}/repos?type=owner&per_page=100")
    repos = [repo for page in pages for repo in page if not repo["private"]]
    external = f"is:public is:pr -user:{ACCOUNT}"
    authored = f"{external} author:{ACCOUNT}"
    counts = [
        ("Public repositories", len(repos)),
        ("Pull requests in other repos", match_count(authored)),
        ("Merged in other repos", match_count(authored + " is:merged")),
        ("Peer PRs reviewed in other repos", match_count(f"{external} reviewed-by:{ACCOUNT} -author:{ACCOUNT}")),
    ]
    as_of = datetime.now(timezone.utc).date().isoformat()
    for name, output in [("github-stats", stats_card(counts, as_of)), ("top-languages", language_card(repos, as_of))]:
        (OUT / f"{name}.svg").write_text(output, encoding="utf-8")


if __name__ == "__main__":
    main()
