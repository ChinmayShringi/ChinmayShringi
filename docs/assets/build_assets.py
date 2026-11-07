#!/usr/bin/env python3
"""Generate the profile README artwork (dark and light variants).

Standard library only. Run from anywhere:

    python3 docs/assets/build_assets.py

Each SVG is self-contained: no scripts, no foreignObject, no external fonts
or images. Motion is CSS only, starts from a meaningful static frame and is
disabled under prefers-reduced-motion.
"""

from pathlib import Path

from atlas_plates import atlas_assets

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


# Capability-aware routing, drawn inside a rounded preview card.
CARD = {"x": 724, "y": 104, "w": 412, "h": 280}
ROUTES = (
    "M781 244H854",
    "M886 244H1010",
    "M870 228V200H950V172H1010",
    "M870 260V288H950V316H1010",
)
TARGETS = (("CPU", 172), ("GPU", 244), ("NPU", 316))

# Tagline words with fixed widths so the moving selection box always fits.
WORDS = (("Systems", 64, 122), ("Intelligence", 206, 178), ("Security", 404, 128))


def handles(t, x, y, w, h, r=5):
    corners = ((x, y), (x + w, y), (x, y + h), (x + w, y + h))
    return "".join(
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{t["bg"]}" stroke="{t["accent"]}" stroke-width="1.5"/>'
        for cx, cy in corners
    )


def selection(t, x, y, w, h, cls="", r=5):
    """Design-tool selection box: hairline frame plus corner handles."""
    return (
        f'<g class="{cls}"><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" '
        f'stroke="{t["accent"]}" stroke-width="1.5"/>{handles(t, x, y, w, h, r)}</g>'
    )


def cursor(t, x, y, name):
    return (
        f'<g transform="translate({x} {y})">'
        f'<path d="M0 0V22L6 16.5L10 26L14 24.2L10 15H18Z" fill="{t["text"]}" stroke="{t["bg"]}" stroke-width="1.5" stroke-linejoin="round"/>'
        f'<rect x="16" y="22" width="{len(name) * 9 + 20}" height="22" rx="11" fill="{t["text"]}"/>'
        f'<text x="26" y="37" class="mono" font-size="11" fill="{t["bg"]}">{name}</text></g>'
    )


def name_block(t):
    box = (46, 232, 528, 112)
    tag_w = 112
    tag_x = box[0] + box[2] // 2 - tag_w // 2
    return f"""<text x="60" y="212" class="sans text" font-size="124" font-weight="800" textLength="572" lengthAdjust="spacingAndGlyphs">CHINMAY</text>
  <text x="60" y="330" class="sans accent" font-size="124" font-weight="800" textLength="508" lengthAdjust="spacingAndGlyphs">SHRINGI</text>
  <g aria-hidden="true">
    {selection(t, *box)}
    <rect x="{tag_x}" y="352" width="{tag_w}" height="22" rx="4" class="accent"/>
    <text x="{tag_x + tag_w // 2}" y="367" text-anchor="middle" class="mono" font-size="11" fill="{t['bg']}">{box[2]} x {box[3]}</text>
    {cursor(t, 584, 338, 'chinmay')}
  </g>"""


def tagline(t):
    words = "".join(
        f'<text x="{x}" y="424" class="sans text" font-size="30" font-weight="600" textLength="{w}" '
        f'lengthAdjust="spacingAndGlyphs">{word}<tspan class="accent">.</tspan></text>'
        for word, x, w in WORDS
    )
    boxes = "".join(
        selection(t, x - 8, 394, w + 16, 42, f"hop hop-{i}", r=3.5) for i, (_, x, w) in enumerate(WORDS)
    )
    return words + f'<g aria-hidden="true">{boxes}</g>'


def target_node(t, name, y):
    return (
        f'<rect x="1010" y="{y - 16}" width="90" height="32" rx="4" fill="{t["bg"]}" stroke="{t["text"]}" stroke-width="1.5"/>'
        f'<text x="1055" y="{y + 5}" text-anchor="middle" class="mono text" font-size="13" font-weight="700">{name}</text>'
    )


def palette_strip(t, x, y, w, h):
    colors = (t["text"], t["accent"], t["accent2"], t["muted"], t["bg"])
    step = w / len(colors)
    return "".join(
        f'<rect x="{x + i * step:.1f}" y="{y}" width="{step + 0.5:.1f}" height="{h}" fill="{c}"/>'
        for i, c in enumerate(colors)
    )


def routing_card(t):
    c = CARD
    base = "".join(f'<path d="{d}" fill="none" stroke="{t["line"]}" stroke-width="2.5"/>' for d in ROUTES)
    flows = "".join(f'<path class="flow" d="{d}"/>' for d in ROUTES)
    targets = "".join(target_node(t, name, y) for name, y in TARGETS)
    return f"""<defs><clipPath id="card-clip"><rect x="{c['x']}" y="{c['y']}" width="{c['w']}" height="{c['h']}" rx="14"/></clipPath></defs>
  <g aria-hidden="true">
    <rect x="{c['x']}" y="{c['y']}" width="{c['w']}" height="{c['h']}" rx="14" fill="{t['panel']}"/>
    <g clip-path="url(#card-clip)">{palette_strip(t, c['x'], c['y'] + c['h'] - 20, c['w'], 20)}</g>
    <rect x="{c['x']}" y="{c['y']}" width="{c['w']}" height="{c['h']}" rx="14" fill="none" stroke="{t['line']}" stroke-width="1.5"/>
    <text x="744" y="134" class="mono muted" font-size="11">PREVIEW / ROUTING</text>
    <rect x="840" y="146" width="276" height="196" rx="6" fill="none" stroke="{t['muted']}" stroke-width="1" stroke-dasharray="3 5"/>
    <text x="852" y="164" class="mono muted" font-size="10">SAFETY BOUND</text>
    {base}
    {flows}
    <circle cx="772" cy="244" r="9" fill="{t['bg']}" stroke="{t['text']}" stroke-width="2"/>
    <text x="772" y="276" text-anchor="middle" class="mono muted" font-size="11">REQ</text>
    <g transform="rotate(45 870 244)"><rect class="pulse" x="854" y="228" width="32" height="32"/></g>
    <rect x="854" y="228" width="32" height="32" class="accent" transform="rotate(45 870 244)"/>
    <circle class="blink" cx="870" cy="244" r="4" fill="{t['bg']}"/>
    {targets}
  </g>
  <text x="{c['x']}" y="424" class="sans text" font-size="20" font-weight="700">Capability routing</text>
  <text x="{c['x'] + c['w']}" y="424" text-anchor="end" class="mono muted" font-size="12">GRAFT / ACM CAIS 2026</text>"""


def pill(t, x, y, label):
    w = len(label) * 9 + 46
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="28" rx="14" fill="{t["panel"]}" stroke="{t["line"]}"/>'
        f'<circle cx="{x + 16}" cy="{y + 14}" r="4" class="accent"/>'
        f'<text x="{x + 30}" y="{y + 19}" class="mono muted" font-size="12">{label}</text>'
    )


HOP_CSS = """.hop { animation: hop 7.5s steps(1) infinite; }
    .hop-1, .hop-2 { opacity: 0; }
    .hop-1 { animation-delay: -5s; }
    .hop-2 { animation-delay: -2.5s; }
    @keyframes hop { 0% { opacity: 1; } 33.33%, 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .hop { animation: none; } }"""


def hero(t):
    w, h = 1200, 500
    body = f"""{style(t).replace('</style>', HOP_CSS + '</style>')}
  {dot_grid(t, w, h)}
  {frame(t, w, h)}

  {pill(t, 64, 50, 'ENGINEER + RESEARCHER / NEW YORK')}
  <text x="1136" y="69" text-anchor="end" class="mono muted" font-size="13">PROFILE.MD // SHEET 01</text>

  {name_block(t)}
  {tagline(t)}
  {routing_card(t)}

  {ruler(t, 64, 1136, 440)}
  <text x="64" y="468" class="mono muted" font-size="12">AI AGENTS / SECURE SYSTEMS / DEVELOPER TOOLS</text>
  <text x="1136" y="468" text-anchor="end" class="mono muted" font-size="12">FIELD NOTES</text>"""

    return svg(
        w, h,
        "Chinmay Shringi: Systems. Intelligence. Security.",
        "Design-canvas header: the name Chinmay Shringi with SHRINGI held in a selection box, "
        "and a preview card showing a request routed to CPU, GPU and NPU targets inside a safety boundary.",
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


# (index, title, title width, inner line, caption, swatch roles, glyph)
DOMAIN_CARDS = (
    ("01", "Systems", 150, "Distributed runtimes", "Isolation and infrastructure", ("text", "muted", "line"), glyph_systems),
    ("02", "Intelligence", 206, "Agents and orchestration", "Retrieval and evaluation", ("accent", "accent2", "line"), glyph_intel),
    ("03", "Security", 156, "Red-team workflows", "Defensive AI benchmarks", ("text", "accent", "grid"), glyph_security),
)
CARD_W, CARD_H, CARD_GAP, CARD_X0, CARD_Y0 = 352, 196, 24, 48, 24
SWATCH_W = 92


def swatches(t, x, y, roles):
    step = CARD_H / len(roles)
    return "".join(
        f'<rect x="{x}" y="{y + i * step:.1f}" width="{SWATCH_W}" height="{step + 0.5:.1f}" fill="{t[role]}"/>'
        for i, role in enumerate(roles)
    )


def domain_card(t, i, card):
    num, name, name_w, line1, caption, roles, glyph = card
    x, y = CARD_X0 + i * (CARD_W + CARD_GAP), CARD_Y0
    tx = x + SWATCH_W + 24
    return (
        f'<clipPath id="dc{i}"><rect x="{x}" y="{y}" width="{CARD_W}" height="{CARD_H}" rx="14"/></clipPath>'
        f'<rect x="{x}" y="{y}" width="{CARD_W}" height="{CARD_H}" rx="14" fill="{t["panel"]}"/>'
        f'<g clip-path="url(#dc{i})">{swatches(t, x, y, roles)}</g>'
        f'<rect x="{x}" y="{y}" width="{CARD_W}" height="{CARD_H}" rx="14" fill="none" stroke="{t["line"]}" stroke-width="1.5"/>'
        f'{glyph(t, x + CARD_W - 80, y + 22)}'
        f'<text x="{tx}" y="{y + 124}" class="sans text" font-size="38" font-weight="800" '
        f'textLength="{name_w}" lengthAdjust="spacingAndGlyphs">{name}</text>'
        f'<text x="{tx}" y="{y + 154}" class="sans muted" font-size="15">{line1}</text>'
        f'<text x="{x}" y="{y + CARD_H + 34}" class="mono accent" font-size="13" font-weight="700">{num}</text>'
        f'<text x="{x + 36}" y="{y + CARD_H + 34}" class="mono muted" font-size="12">{caption.upper()}</text>'
    )


def domains(t):
    w, h = 1200, 276
    cards = "".join(domain_card(t, i, card) for i, card in enumerate(DOMAIN_CARDS))
    body = f"""{style(t)}
  <rect width="{w}" height="{h}" fill="{t['bg']}"/>
  {cards}"""
    return svg(
        w, h,
        "Three domains: Systems, Intelligence, Security",
        "Three specimen cards with color swatches: 01 Systems, distributed runtimes, isolation and infrastructure; "
        "02 Intelligence, agents and orchestration, retrieval and evaluation; "
        "03 Security, red-team workflows and defensive AI benchmarks.",
        body,
    )


TOKENS = (("INK", "text"), ("PAPER", "bg"), ("VERMILION", "accent"), ("EMBER", "accent2"), ("STONE", "muted"))


def token(t, i, name, role):
    x = 64 + i * 128
    return (
        f'<rect x="{x}" y="64" width="64" height="64" rx="12" fill="{t[role]}" stroke="{t["line"]}" stroke-width="1.5"/>'
        f'<text x="{x}" y="150" class="mono text" font-size="11">{name}</text>'
        f'<text x="{x}" y="168" class="mono muted" font-size="11">{t[role]}</text>'
    )


def footer(t):
    w, h = 1200, 220
    line, text = t["line"], t["text"]
    tokens = "".join(token(t, i, name, role) for i, (name, role) in enumerate(TOKENS))
    body = f"""{style(t)}
  {dot_grid(t, w, h)}
  {frame(t, w, h)}
  <text x="64" y="50" class="mono muted" font-size="11">DESIGN TOKENS</text>
  {tokens}
  <g aria-hidden="true">
    <path d="M720 96H820V72H940V96H1020" fill="none" stroke="{line}" stroke-width="2.5"/>
    <path class="flow" d="M720 96H820V72H940V96H1020"/>
    <circle cx="720" cy="96" r="6" fill="{t['bg']}" stroke="{text}" stroke-width="2"/>
    <circle class="pulse" cx="1050" cy="96" r="22"/>
    <circle cx="1050" cy="96" r="22" class="accent"/>
    <circle class="blink" cx="1050" cy="96" r="6" fill="{t['bg']}"/>
  </g>
  <text x="1136" y="150" text-anchor="end" class="mono text" font-size="12">END OF NOTES // SIGNAL OPEN</text>
  <text x="1136" y="168" text-anchor="end" class="mono muted" font-size="12">CS7810 AT NYU.EDU</text>"""
    return svg(
        w, h,
        "End of notes",
        "Closing sheet listing the profile's design tokens (ink, paper, vermilion, ember, stone) "
        "beside a routing line that ends at a glowing vermilion node.",
        body,
    )


def main():
    for name, fn in (("hero", hero), ("domains", domains), ("footer", footer)):
        for theme, t in THEMES.items():
            path = OUT / f"{name}-{theme}.svg"
            path.write_text(fn(t), encoding="utf-8")
            print(f"wrote {path.relative_to(OUT.parent.parent)}")
    shared = (style, dot_grid, frame, svg)
    for theme, t in THEMES.items():
        for name, artwork in atlas_assets(t, shared):
            path = OUT / f"{name}-{theme}.svg"
            path.write_text(artwork, encoding="utf-8")
            print(f"wrote {path.relative_to(OUT.parent.parent)}")


if __name__ == "__main__":
    main()
