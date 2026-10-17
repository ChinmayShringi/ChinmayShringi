#!/usr/bin/env python3
"""Generate the profile README artwork (dark and light variants).

Standard library only. Run from anywhere:

    python3 docs/assets/build_assets.py

Each SVG is self-contained: no scripts, no foreignObject, no external fonts
or images. Motion is CSS only, starts from a meaningful static frame and is
disabled under prefers-reduced-motion.
"""

from pathlib import Path

OUT = Path(__file__).resolve().parent

THEMES = {
    "dark": {
        "bg": "#12100E",
        "text": "#F4EDE1",
        "muted": "#9A9086",
        "line": "#3A332C",
        "grid": "#2A241F",
        "accent": "#FF5A1F",
        "accent2": "#FF9A3C",
        "panel": "#1A1714",
    },
    "light": {
        "bg": "#F6F0E5",
        "text": "#16120F",
        "muted": "#675E54",
        "line": "#CFC3B1",
        "grid": "#E3D8C6",
        "accent": "#E0400C",
        "accent2": "#C9621A",
        "panel": "#EFE7D9",
    },
}

SANS = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif"
MONO = "'JetBrains Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"


def style(t):
    return f"""<style>
    .sans {{ font-family: {SANS}; }}
    .mono {{ font-family: {MONO}; letter-spacing: 2px; }}
    .text {{ fill: {t['text']}; }}
    .muted {{ fill: {t['muted']}; }}
    .accent {{ fill: {t['accent']}; }}
    .flow {{ fill: none; stroke: {t['accent']}; stroke-width: 2.5; stroke-dasharray: 6 14; stroke-linecap: round; animation: flow 1.6s linear infinite; }}
    .pulse {{ fill: none; stroke: {t['accent']}; stroke-width: 1.5; opacity: 0.35; transform-box: fill-box; transform-origin: center; animation: pulse 2.8s ease-out infinite; }}
    .blink {{ animation: blink 2.4s steps(1) infinite; }}
    @keyframes flow {{ to {{ stroke-dashoffset: -40; }} }}
    @keyframes pulse {{ 0% {{ transform: scale(1); opacity: 0.55; }} 100% {{ transform: scale(1.9); opacity: 0; }} }}
    @keyframes blink {{ 50% {{ opacity: 0.2; }} }}
    @media (prefers-reduced-motion: reduce) {{
      .flow, .pulse, .blink {{ animation: none; }}
    }}
  </style>"""


def dot_grid(t, w, h, step=24):
    return f"""<defs>
    <pattern id="dots" width="{step}" height="{step}" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="{t['grid']}"/>
    </pattern>
  </defs>
  <rect width="{w}" height="{h}" fill="{t['bg']}"/>
  <rect width="{w}" height="{h}" fill="url(#dots)"/>"""


def frame(t, w, h, inset=24):
    """Hairline frame with vermilion corner registration marks."""
    x0, y0, x1, y1 = inset, inset, w - inset, h - inset
    a, L = t["accent"], 18
    corners = (
        f"M{x0} {y0 + L}V{y0}H{x0 + L}",
        f"M{x1 - L} {y0}H{x1}V{y0 + L}",
        f"M{x0} {y1 - L}V{y1}H{x0 + L}",
        f"M{x1 - L} {y1}H{x1}V{y1 - L}",
    )
    marks = "".join(f'<path d="{d}" fill="none" stroke="{a}" stroke-width="3"/>' for d in corners)
    return (
        f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="none" '
        f'stroke="{t["line"]}" stroke-width="1"/>{marks}'
    )


def tick(t, i, x, y):
    major = i % 5 == 0
    return (
        f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y + (12 if major else 6)}" '
        f'stroke="{t["accent"] if major else t["line"]}" stroke-width="{1.5 if major else 1}"/>'
    )


def ruler(t, x0, x1, y):
    ticks = "".join(tick(t, i, x, y) for i, x in enumerate(range(x0, x1 + 1, 16)))
    return f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{t["line"]}"/>' + ticks


def svg(w, h, title, desc, body):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-labelledby="title desc">
  <title id="title">{title}</title>
  <desc id="desc">{desc}</desc>
  {body}
</svg>
"""


# Faint background constellation: distributed nodes behind the router diagram.
FAR_NODES = ((720, 120), (790, 170), (760, 330), (840, 380), (960, 110), (1010, 390), (1120, 120), (1130, 395))
FAR_LINKS = ((0, 1), (1, 4), (2, 3), (3, 5), (4, 6), (5, 7))

# Capability-aware routing: one request fans out to heterogeneous targets.
ROUTES = (
    "M748 245H882",
    "M918 245H1040",
    "M900 227V190H990V156H1040",
    "M900 263V300H990V334H1040",
)
TARGETS = (("CPU", 156), ("GPU", 245), ("NPU", 334))


def constellation(t):
    links = "".join(
        f'<line x1="{FAR_NODES[i][0]}" y1="{FAR_NODES[i][1]}" x2="{FAR_NODES[j][0]}" y2="{FAR_NODES[j][1]}" '
        f'stroke="{t["line"]}" stroke-width="1"/>'
        for i, j in FAR_LINKS
    )
    nodes = "".join(f'<circle cx="{x}" cy="{y}" r="3" fill="{t["line"]}"/>' for x, y in FAR_NODES)
    return links + nodes


def target_node(t, name, y):
    return (
        f'<rect x="1040" y="{y - 16}" width="76" height="32" fill="{t["panel"]}" stroke="{t["text"]}" stroke-width="1.5"/>'
        f'<text x="1078" y="{y + 5}" text-anchor="middle" class="mono text" font-size="13" font-weight="700">{name}</text>'
    )


def routing_diagram(t):
    base = "".join(f'<path d="{d}" fill="none" stroke="{t["line"]}" stroke-width="2.5"/>' for d in ROUTES)
    flows = "".join(f'<path class="flow" d="{d}"/>' for d in ROUTES)
    targets = "".join(target_node(t, name, y) for name, y in TARGETS)
    return f"""<g aria-hidden="true">
    {constellation(t)}
    <rect x="860" y="124" width="276" height="242" fill="none" stroke="{t['muted']}" stroke-width="1" stroke-dasharray="3 5"/>
    <text x="872" y="144" class="mono muted" font-size="11">SAFETY BOUND</text>
    {base}
    {flows}
    <circle cx="740" cy="245" r="9" fill="{t['bg']}" stroke="{t['text']}" stroke-width="2"/>
    <text x="740" y="276" text-anchor="middle" class="mono muted" font-size="11">REQ</text>
    <g transform="rotate(45 900 245)"><rect class="pulse" x="882" y="227" width="36" height="36"/></g>
    <rect x="882" y="227" width="36" height="36" class="accent" transform="rotate(45 900 245)"/>
    <circle class="blink" cx="900" cy="245" r="4" fill="{t['bg']}"/>
    <text x="852" y="232" text-anchor="end" class="mono muted" font-size="11">ROUTE</text>
    {targets}
  </g>"""


def hero(t):
    w, h = 1200, 480
    body = f"""{style(t)}
  {dot_grid(t, w, h)}
  {frame(t, w, h)}

  <text x="64" y="68" class="mono muted" font-size="14">FIELD NOTES // ENGINEERING + RESEARCH</text>
  <text x="1136" y="68" text-anchor="end" class="mono muted" font-size="14">NEW YORK, NY</text>
  <line x1="64" y1="86" x2="1136" y2="86" stroke="{t['line']}"/>

  <rect x="64" y="112" width="14" height="14" class="accent"/>
  <text x="90" y="125" class="mono muted" font-size="13">PROFILE / 001</text>

  <text x="60" y="232" class="sans text" font-size="124" font-weight="800" textLength="572" lengthAdjust="spacingAndGlyphs">CHINMAY</text>
  <text x="60" y="346" class="sans accent" font-size="124" font-weight="800" textLength="508" lengthAdjust="spacingAndGlyphs">SHRINGI</text>

  <text x="64" y="398" class="sans text" font-size="30" font-weight="600">Systems<tspan class="accent">.</tspan> Intelligence<tspan class="accent">.</tspan> Security<tspan class="accent">.</tspan></text>

  {routing_diagram(t)}

  {ruler(t, 64, 1136, 420)}
  <text x="64" y="448" class="mono muted" font-size="12">AI AGENTS / SECURE SYSTEMS / DEVELOPER TOOLS</text>
  <text x="1136" y="448" text-anchor="end" class="mono muted" font-size="12">SHEET 01</text>"""

    return svg(
        w, h,
        "Chinmay Shringi: Systems. Intelligence. Security.",
        "Editorial header with the name Chinmay Shringi in large type and a small diagram "
        "of a request routed to CPU, GPU and NPU targets inside a safety boundary.",
        body,
    )


def glyph_systems(t, x, y):
    # Stacked layers: runtimes, isolation, infrastructure.
    return "".join(
        f'<rect x="{x}" y="{y + i * 14}" width="56" height="9" fill="{t["accent"] if i == 0 else "none"}" '
        f'stroke="{t["text"]}" stroke-width="1.5"/>'
        for i in range(3)
    )


def glyph_intel(t, x, y):
    # Small agent graph with one highlighted output node.
    pts = ((x, y + 18), (x + 28, y), (x + 28, y + 36), (x + 56, y + 18))
    links = ((0, 1), (0, 2), (1, 3), (2, 3), (1, 2))
    edges = "".join(
        f'<line x1="{pts[i][0]}" y1="{pts[i][1]}" x2="{pts[j][0]}" y2="{pts[j][1]}" stroke="{t["text"]}" stroke-width="1.5"/>'
        for i, j in links
    )
    nodes = "".join(
        f'<circle cx="{px}" cy="{py}" r="5" fill="{t["accent"] if k == 3 else t["panel"]}" '
        f'stroke="{t["text"]}" stroke-width="1.5"/>'
        for k, (px, py) in enumerate(pts)
    )
    return edges + nodes


def glyph_security(t, x, y):
    # Nested boundaries around a protected core.
    return (
        f'<rect x="{x}" y="{y}" width="56" height="40" fill="none" stroke="{t["text"]}" stroke-width="1.5" stroke-dasharray="4 4"/>'
        f'<rect x="{x + 12}" y="{y + 9}" width="32" height="22" fill="none" stroke="{t["text"]}" stroke-width="1.5"/>'
        f'<rect x="{x + 22}" y="{y + 15}" width="12" height="10" fill="{t["accent"]}"/>'
    )


DOMAIN_CARDS = (
    ("01", "SYSTEMS", "Distributed runtimes", "Isolation and infrastructure", glyph_systems),
    ("02", "INTELLIGENCE", "Agents and orchestration", "Retrieval and evaluation", glyph_intel),
    ("03", "SECURITY", "Red-team workflows", "Defensive AI benchmarks", glyph_security),
)
CARD_W, CARD_GAP, CARD_X0, CARD_Y0 = 352, 24, 48, 36


def domain_card(t, i, card):
    num, name, l1, l2, glyph = card
    x, y0 = CARD_X0 + i * (CARD_W + CARD_GAP), CARD_Y0
    return (
        f'<rect x="{x}" y="{y0}" width="{CARD_W}" height="188" fill="{t["panel"]}" stroke="{t["line"]}"/>'
        f'<rect x="{x}" y="{y0}" width="{CARD_W}" height="4" fill="{t["accent"]}"/>'
        f'<text x="{x + 24}" y="{y0 + 44}" class="mono accent" font-size="14" font-weight="700">{num}</text>'
        f'{glyph(t, x + CARD_W - 80, y0 + 22)}'
        f'<text x="{x + 24}" y="{y0 + 112}" class="sans text" font-size="34" font-weight="800">{name}</text>'
        f'<text x="{x + 24}" y="{y0 + 144}" class="mono muted" font-size="13">{l1.upper()}</text>'
        f'<text x="{x + 24}" y="{y0 + 166}" class="mono muted" font-size="13">{l2.upper()}</text>'
    )


def domains(t):
    w, h = 1200, 260
    cards = "".join(domain_card(t, i, card) for i, card in enumerate(DOMAIN_CARDS))
    body = f"""{style(t)}
  <rect width="{w}" height="{h}" fill="{t['bg']}"/>
  {cards}"""
    return svg(
        w, h,
        "Three domains: Systems, Intelligence, Security",
        "Three numbered cards: 01 Systems, distributed runtimes, isolation and infrastructure; "
        "02 Intelligence, agents, orchestration, retrieval and evaluation; "
        "03 Security, red-team workflows and defensive AI benchmarks.",
        body,
    )


def footer(t):
    w, h = 1200, 200
    a, line, text = t["accent"], t["line"], t["text"]
    body = f"""{style(t)}
  {dot_grid(t, w, h)}
  {frame(t, w, h)}
  <g aria-hidden="true">
    <path d="M64 100H360V70H620V100H1000" fill="none" stroke="{line}" stroke-width="2.5"/>
    <path class="flow" d="M64 100H360V70H620V100H1000"/>
    <circle cx="64" cy="100" r="6" fill="{t['bg']}" stroke="{text}" stroke-width="2"/>
    <circle cx="360" cy="100" r="4" fill="{line}"/>
    <circle cx="620" cy="70" r="4" fill="{line}"/>
    <circle class="pulse" cx="1030" cy="100" r="22"/>
    <circle cx="1030" cy="100" r="22" class="accent"/>
    <circle class="blink" cx="1030" cy="100" r="6" fill="{t['bg']}"/>
  </g>
  <text x="64" y="150" class="mono muted" font-size="13">END OF NOTES // SIGNAL OPEN</text>
  <text x="1136" y="150" text-anchor="end" class="mono muted" font-size="13">CS7810 AT NYU.EDU</text>"""
    return svg(
        w, h,
        "End of notes",
        "A routing line that ends at a glowing vermilion node, closing the profile.",
        body,
    )


def main():
    for name, fn in (("hero", hero), ("domains", domains), ("footer", footer)):
        for theme, t in THEMES.items():
            path = OUT / f"{name}-{theme}.svg"
            path.write_text(fn(t), encoding="utf-8")
            print(f"wrote {path.relative_to(OUT.parent.parent)}")


if __name__ == "__main__":
    main()
