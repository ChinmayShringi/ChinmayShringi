"""Original Systems Atlas plates, rendered by the shared asset generator."""

from html import escape


def text(x, y, value, size=18, kind="text", weight=400, anchor="start"):
    return (
        f'<text x="{x}" y="{y}" class="sans {kind}" font-size="{size}" '
        f'font-weight="{weight}" text-anchor="{anchor}">{escape(value)}</text>'
    )


def label(x, y, value, size=13, kind="muted", anchor="start"):
    return (
        f'<text x="{x}" y="{y}" class="mono {kind}" font-size="{size}" '
        f'text-anchor="{anchor}">{escape(value)}</text>'
    )


def path(t, d, kind="line", width=2, dash=""):
    return (
        f'<path d="{d}" fill="none" stroke="{t[kind]}" stroke-width="{width}" '
        f'stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="{dash}"/>'
    )


def route(t, d):
    return path(t, d, width=3) + f'<path class="flow" d="{d}"/>'


def rect(t, x, y, w, h, fill="panel", stroke="line"):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" '
        f'fill="{t[fill]}" stroke="{t[stroke]}" stroke-width="1.5"/>'
    )


def circle(t, x, y, r=6, fill="bg", stroke="accent"):
    return (
        f'<circle cx="{x}" cy="{y}" r="{r}" fill="{t[fill]}" '
        f'stroke="{t[stroke]}" stroke-width="2"/>'
    )


def arrow(t, x, y, direction="right", size=8):
    points = {
        "right": f"M{x-size} {y-size}L{x} {y}L{x-size} {y+size}",
        "left": f"M{x+size} {y-size}L{x} {y}L{x+size} {y+size}",
        "down": f"M{x-size} {y-size}L{x} {y}L{x+size} {y-size}",
        "up": f"M{x-size} {y+size}L{x} {y}L{x+size} {y+size}",
    }
    return path(t, points[direction], "accent", 2.5)


def header(t, w, value, number, mobile=False):
    edge, size, baseline = (48, 20, 62) if mobile else (64, 13, 64)
    return (
        label(edge, baseline, value, size)
        + label(w-edge, baseline, number, size, "accent", "end")
        + path(t, f"M{edge} {baseline+20}H{w-edge}", width=1)
    )


def footer(t, w, h, value, mobile=False):
    edge, size = (48, 20) if mobile else (64, 12)
    return (
        path(t, f"M{edge} {h-68}H{w-edge}", width=1)
        + label(edge, h-36, value, size)
        + label(w-edge, h-36, "+", size, "accent", "end")
    )


def launch_node(t, x, y, name, index, selected=False, anchor="start"):
    offset = 16 if anchor == "start" else -16
    return (
        circle(t, x, y, 7 if selected else 5, "accent" if selected else "bg")
        + text(x+offset, y+6, name, 19, weight=650, anchor=anchor)
        + label(x+offset, y-17, index, 10, anchor=anchor)
    )


def launch_map(t):
    regions = (
        path(t, "M580 125C690 72 1030 76 1136 170", dash="3 9", width=1),
        path(t, "M590 210C730 170 1090 255 1136 398", dash="3 9", width=1),
        path(t, "M620 422C720 524 1048 558 1136 460", dash="3 9", width=1),
    )
    links = (
        "M614 164L790 243L1030 197", "M1030 197L1080 330",
        "M614 164L698 360L866 418", "M698 360L948 324L1080 330",
        "M790 243L866 418L778 492L1048 490", "M1030 197L778 492",
        "M948 134L614 164", "M866 418L948 324",
    )
    nodes = (
        (614, 164, "GRAFT", "01 / PAPER", True, "start"),
        (948, 134, "AI-Driven DB", "07 / PAPER", False, "start"),
        (790, 243, "SLM Swarm", "02 / PROJECT", False, "end"),
        (1030, 197, "Shoemaker Elves", "03 / PROJECT", False, "end"),
        (1080, 330, "SourceSnap", "04 / PROJECT", True, "end"),
        (698, 360, "Hybrid RAG", "06 / PROJECT", False, "end"),
        (866, 418, "Persona AI", "05 / PROJECT", False, "start"),
        (778, 492, "Branch / Commit / Validate", "08 / PAPER", False, "end"),
        (1048, 490, "Spotlight", "09 / PROJECT", False, "start"),
    )
    return (
        "".join(regions) + "".join(path(t, d) for d in links)
        + route(t, "M614 164L790 243L1030 197L1080 330")
        + "".join(launch_node(t, *node) for node in nodes)
        + label(614, 100, "SYSTEMS", 13, "accent")
        + label(874, 284, "INTELLIGENCE", 13, "accent")
        + label(978, 548, "SECURITY", 13, "accent")
    )


def launch_desktop(t):
    return (
        header(t, 1200, "A FIELD GUIDE TO THE WORK", "ATLAS / 001")
        + text(60, 186, "SYSTEMS", 105, weight=850)
        + text(60, 286, "ATLAS", 105, "accent", 850)
        + label(64, 328, "CHINMAY SHRINGI / ENGINEERING + RESEARCH", 12)
        + text(64, 384, "Trace the ideas.", 29, weight=500)
        + text(64, 424, "Inspect the systems.", 29, weight=500)
        + path(t, "M64 480H414", "accent", 2)
        + text(64, 515, "ENTER THE ATLAS", 24, weight=750)
        + path(t, "M362 506H416", "accent", 2.5)
        + arrow(t, 416, 506)
        + launch_map(t)
        + footer(t, 1200, 640, "PROJECTS + PUBLICATIONS / CONCEPTUAL CONNECTIONS")
    )


def mobile_domain(t, y, index, name, entries):
    base = (
        label(48, y, index, 20, "accent")
        + text(104, y+2, name, 28, weight=800)
        + path(t, f"M64 {y+20}V{y+len(entries)*48}", "accent", 2)
    )
    return base + "".join(
        path(t, f"M64 {y+42+i*48}H110", width=1.5)
        + circle(t, 114, y+42+i*48, 4)
        + text(136, y+51+i*48, entry, 28, weight=550)
        for i, entry in enumerate(entries)
    )


def launch_mobile(t):
    return (
        header(t, 720, "FIELD GUIDE TO THE WORK", "001", True)
        + text(44, 190, "SYSTEMS", 104, weight=850)
        + text(44, 290, "ATLAS", 104, "accent", 850)
        + text(48, 345, "Trace the ideas. Inspect the systems.", 29, weight=500)
        + mobile_domain(t, 420, "01", "SYSTEMS", ("GRAFT", "AI-Driven Database"))
        + mobile_domain(t, 595, "02", "INTELLIGENCE", (
            "SLM Swarm", "Shoemaker Elves", "SourceSnap", "Persona AI", "Hybrid RAG"))
        + mobile_domain(t, 910, "03", "SECURITY", ("Branch-Commit-Validate", "Spotlight Benchmark"))
        + path(t, "M48 1076H672", "accent", 2)
        + text(48, 1126, "ENTER THE ATLAS", 34, weight=750)
        + path(t, "M580 1114H658", "accent", 3)
        + arrow(t, 658, 1114, size=12)
        + footer(t, 720, 1240, "PROJECTS + PUBLICATIONS / CONCEPT MAP", True)
    )


def browser_drawing(t, mobile=False):
    rows = ((20, 60, 48, 8), (20, 79, 90, 8), (20, 98, 65, 8), (20, 135, 168, 8))
    return (
        rect(t, 0, 0, 220, 174)
        + path(t, "M0 28H220", width=1)
        + "".join(circle(t, x, 14, 2.2, "muted", "muted") for x in (14, 25, 36))
        + "".join(rect(t, *row, "line", "line") for row in rows)
        + rect(t, 130, 58, 66, 51, "bg", "accent")
        + path(t, "M147 77H179M147 88H170", "accent", 3)
        + path(t, "M169 98L179 125L184 116L195 112Z", "text", 2)
        + label(110, 158, "ALT + CLICK", 20 if mobile else 10, "accent", "middle")
    )


def framework_drawing(t, mobile=False):
    names = (("REACT", 22), ("VUE", 52), ("SVELTE", 82), ("SOLIDJS", 112), ("PREACT", 142))
    start = 154 if mobile else 108
    return (
        rect(t, 0, 0, 220, 174)
        + "".join(
            label(16, y, name, 22 if mobile else 11)
            + path(t, f"M{start} {y-4}H168L190 83", width=1.5)
            + circle(t, start, y-4, 2.3, "bg", "muted")
            for name, y in names
        )
        + circle(t, 190, 83, 11, "accent")
        + path(t, "M190 83H212", "accent", 2)
        + label(110, 168 if mobile else 159, "METADATA" if mobile else "FRAMEWORK METADATA",
                18 if mobile else 9, "accent", "middle")
    )


def source_drawing(t, mobile=False):
    return (
        rect(t, 0, 0, 220, 174)
        + path(t, "M38 20H146L182 56V148H38Z", "muted", 1.5)
        + path(t, "M146 20V56H182", "muted", 1.5)
        + path(t, "M55 76H133M55 93H159M55 110H146M55 127H111", width=3)
        + rect(t, 31, 87, 158, 21, "bg", "accent")
        + text(43, 103, "FILE : LINE" if mobile else "source file : line", 20 if mobile else 13, "accent", 600)
        + path(t, "M16 87H26M16 108H26M16 87V108", "accent", 2)
    )


def editor_drawing(t, mobile=False):
    lines = ((81, 55, 90), (94, 76, 64), (94, 97, 82), (107, 118, 53), (81, 139, 70))
    return (
        rect(t, 0, 0, 220, 174)
        + path(t, "M0 28H220M58 28V174", width=1)
        + label(12, 22 if mobile else 19, "EDITOR", 20 if mobile else 9, "muted")
        + path(t, "M12 49H43M19 67H42M19 85H43M19 103H35", width=2)
        + "".join(path(t, f"M{x} {y}H{x+w}", width=5) for x, y, w in lines)
        + rect(t, 69, 86, 142, 22, "bg", "accent")
        + path(t, "M95 97H175", "accent", 4)
        + path(t, "M73 93L78 97L73 101", "accent", 1.5)
    )


SOURCE_STEPS = (
    ("01", "ELEMENT", "Pick an element", browser_drawing),
    ("02", "FRAMEWORK", "Read metadata", framework_drawing),
    ("03", "SOURCE", "Resolve file + line", source_drawing),
    ("04", "EDITOR", "Open at the source", editor_drawing),
)


def source_step(t, i, step):
    number, name, note, drawing = step
    x = 64+i*284
    link = route(t, f"M{x+224} 340H{x+272}") + arrow(t, x+272, 340) if i < 3 else ""
    return (
        label(x, 234, number, 13, "accent")
        + text(x+35, 235, name, 18, weight=750)
        + f'<g transform="translate({x} 254)">{drawing(t)}</g>'
        + text(x, 459, note, 19, weight=500)
        + link
    )


def sourcesnap_desktop(t):
    return (
        header(t, 1200, "BROWSER TO SOURCE / DEVELOPER TOOLING", "TRACE / 002")
        + text(60, 176, "SourceSnap", 94, weight=850)
        + text(750, 133, "ONE GESTURE.", 27, "accent", 800)
        + text(750, 171, "STRAIGHT TO CODE.", 27, weight=800)
        + "".join(source_step(t, i, step) for i, step in enumerate(SOURCE_STEPS))
        + footer(t, 1200, 570, "NO BUNDLER PLUGIN / ILLUSTRATIVE TRACE")
    )


def source_mobile_step(t, i, step):
    number, name, note, drawing = step
    y = 300+i*220
    link = route(t, f"M72 {y+28}V{y+190}") + arrow(t, 72, y+190, "down", 7) if i < 3 else ""
    return (
        circle(t, 72, y-9, 22, "bg", "accent")
        + text(72, y-1, number, 21, "accent", 700, "middle")
        + text(115, y+2, name, 30, weight=800)
        + text(115, y+43, note, 22)
        + f'<g transform="translate(385 {y-60}) scale(1.15)">{drawing(t, True)}</g>'
        + link
    )


def sourcesnap_mobile(t):
    return (
        header(t, 720, "BROWSER TO SOURCE", "002", True)
        + text(44, 180, "SourceSnap", 86, weight=850)
        + text(48, 228, "One gesture. Straight to code.", 31, "accent", 650)
        + "".join(source_mobile_step(t, i, step) for i, step in enumerate(SOURCE_STEPS))
        + text(48, 1110, "No bundler plugin required.", 27, weight=650)
        + footer(t, 720, 1230, "ILLUSTRATIVE ARCHITECTURE TRACE", True)
    )


def task_sheet(t, x, y, width, number, title):
    return (
        rect(t, x, y, width, 47, "panel", "line")
        + label(x+13, y+29, number, 12, "accent")
        + text(x+45, y+29, title, 16, weight=550)
    )


def planning_drawing(t):
    return (
        task_sheet(t, 16, 0, 205, "01", "atomic task")
        + task_sheet(t, 8, 50, 205, "02", "atomic task")
        + task_sheet(t, 0, 100, 205, "N", "atomic task")
        + path(t, "M232 10V138M227 10H237M227 138H237", "accent", 1.5)
    )


def execution_drawing(t):
    nodes = (("01", 40), ("02", 164), ("N", 288))
    return (
        rect(t, 0, 0, 328, 147)
        + label(164, 26, "CODING AGENT", 12, "muted", "middle")
        + route(t, "M40 77H288")
        + "".join(
            circle(t, x, 77, 22, "bg", "accent")
            + text(x, 84, name, 19, "accent", 700, "middle")
            for name, x in nodes
        )
        + arrow(t, 111, 77, size=6) + arrow(t, 236, 77, size=6)
        + label(164, 128, "ONE TASK AT A TIME", 10, "muted", "middle")
    )


def review_drawing(t):
    return (
        rect(t, 0, 0, 220, 147)
        + label(110, 27, "LLM REVIEW", 12, "accent", "middle")
        + path(t, "M28 53H94M28 73H82M28 93H103M28 113H69", width=4)
        + path(t, "M135 49L188 49L188 104L161 123L135 104Z", "text", 1.5)
        + path(t, "M146 79H176M146 91H168", "accent", 3)
        + path(t, "M123 43V129M119 43H127M119 129H127", "accent", 1)
    )


def shoemaker_desktop(t):
    return (
        header(t, 1200, "FROM INTENT TO REVIEWABLE WORK", "TRACE / 003")
        + text(60, 176, "Shoemaker Elves", 83, weight=850)
        + label(64, 232, "01 / PLAN A BATCH", 15, "accent")
        + label(412, 232, "02 / EXECUTE IN SEQUENCE", 15, "accent")
        + label(900, 232, "03 / REVIEW RESULTS", 15, "accent")
        + f'<g transform="translate(64 260)">{planning_drawing(t)}</g>'
        + f'<g transform="translate(412 260)">{execution_drawing(t)}</g>'
        + f'<g transform="translate(900 260)">{review_drawing(t)}</g>'
        + route(t, "M306 333H390") + arrow(t, 390, 333)
        + route(t, "M750 333H878") + arrow(t, 878, 333)
        + route(t, "M1010 418V466H176V421") + arrow(t, 176, 421, "up")
        + rect(t, 429, 449, 323, 34, "bg", "bg")
        + label(590, 472, "04 / PLAN THE NEXT BATCH", 15, "accent", "middle")
        + footer(t, 1200, 580, "LLM MODE / ILLUSTRATIVE WORKFLOW / SEQUENTIAL EXECUTION")
    )


def workflow_mobile_heading(t, y, number, title, note):
    return (
        label(48, y, number, 22, "accent")
        + text(108, y+1, title, 32, weight=800)
        + text(108, y+43, note, 25)
    )


def shoemaker_mobile(t):
    return (
        header(t, 720, "REVIEWABLE AGENT WORK", "003", True)
        + text(44, 175, "Shoemaker", 91, weight=850)
        + text(44, 265, "Elves", 91, "accent", 850)
        + workflow_mobile_heading(t, 340, "01", "PLAN A BATCH", "An LLM writes atomic tasks.")
        + f'<g transform="translate(108 412) scale(1.35)">{planning_drawing(t)}</g>'
        + workflow_mobile_heading(t, 704, "02", "EXECUTE IN SEQUENCE", "A coding agent runs each task.")
        + f'<g transform="translate(108 778) scale(1.4)">{execution_drawing(t)}</g>'
        + workflow_mobile_heading(t, 1070, "03", "REVIEW RESULTS", "The LLM checks the work.")
        + f'<g transform="translate(108 1144) scale(1.35)">{review_drawing(t)}</g>'
        + workflow_mobile_heading(t, 1470, "04", "PLAN THE NEXT BATCH", "Review feeds the next plan.")
        + route(t, "M451 1244H630V430H464")
        + arrow(t, 464, 430, "left", 10)
        + route(t, "M80 615V661") + arrow(t, 80, 661, "down", 8)
        + route(t, "M80 987V1031") + arrow(t, 80, 1031, "down", 8)
        + route(t, "M80 1366V1429") + arrow(t, 80, 1429, "down", 8)
        + '<g transform="rotate(-90 650 900)">'
        + label(650, 900, "REVIEW LOOP", 20, "accent", "middle") + '</g>'
        + footer(t, 720, 1620, "LLM MODE / ILLUSTRATIVE WORKFLOW", True)
    )


PLATES = (
    ("atlas-launch", 1200, 640, launch_desktop),
    ("atlas-launch-mobile", 720, 1240, launch_mobile),
    ("sourcesnap-trace", 1200, 570, sourcesnap_desktop),
    ("sourcesnap-trace-mobile", 720, 1230, sourcesnap_mobile),
    ("shoemaker-trace", 1200, 580, shoemaker_desktop),
    ("shoemaker-trace-mobile", 720, 1620, shoemaker_mobile),
)

DESCRIPTIONS = {
    "atlas": (
        "Systems Atlas: trace the ideas and inspect the systems",
        "An engineering field guide connecting Systems, Intelligence and Security to nine public "
        "projects and publications by Chinmay Shringi. Entries include GRAFT, SLM Swarm, "
        "Shoemaker Elves, SourceSnap, Persona AI, Hybrid RAG, AI-Driven Database, "
        "Branch-Commit-Validate and Spotlight Benchmark. Connections are conceptual, not runtime data. "
        "Open the linked interactive Atlas to explore the work.",
    ),
    "sourcesnap": (
        "SourceSnap: from browser element to source file",
        "An illustrative four-stage trace: Alt+Click an element, inspect React, Vue, Svelte, "
        "SolidJS or Preact metadata, resolve the source file and line, then open the selected editor. "
        "SourceSnap is a browser extension that requires no bundler plugin.",
    ),
    "shoemaker": (
        "Shoemaker Elves: plan, execute, review and plan the next batch",
        "An illustrative LLM-mode workflow. An LLM plans a batch of atomic tasks, a coding agent "
        "executes them one at a time, and the LLM reviews results before planning the next batch. "
        "The return path represents the review loop, not measured activity.",
    ),
}


def atlas_assets(t, shared):
    style, dot_grid, frame, svg = shared
    return tuple(
        (
            name,
            svg(w, h, *DESCRIPTIONS[name.split("-")[0]],
                style(t) + dot_grid(t, w, h) + frame(t, w, h) + draw(t)),
        )
        for name, w, h, draw in PLATES
    )
