"""CGC logo v2: the same three-ring C-G-C mark and gray/amber equity, redrawn.

- True over/under weave (masks, so it works on any background), heavier even stroke, butt terminals.
- Graphite rings, brand amber G; wordmark outlined from the site's Archivo (OFL) instead of Century Gothic.
- Outputs to site/assets/: logo-v2.svg (horizontal), logo-v2-stacked.svg, logo-v2-mark.svg, logo-v2-dark.svg.

  python logo_v2.py
"""
import math
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

A = "C:/Users/Moqui/Projects/Dd/cgc/site/assets/"
INK, AMBER, LIGHT = "#172126", "#F2A81D", "#FFFFFF"
R, SW, GAP, CY, D = 90, 24, 9, 114, 104          # ring radius, stroke, weave gap, centre y, ring spacing
CX = [114, 114 + D, 114 + 2 * D]
H = math.degrees(math.atan2(math.sqrt(R * R - (D / 2) ** 2), D / 2))   # crossing angle on the left ring


def pt(cx, a):
    a = math.radians(a)
    return cx + R * math.cos(a), CY + R * math.sin(a)


def long_arc(cx, a0, a1):
    """From a0 counter-clockwise (through the left side) to a1."""
    (x0, y0), (x1, y1) = pt(cx, a0), pt(cx, a1)
    return f"M{x0:.2f} {y0:.2f}A{R} {R} 0 1 0 {x1:.2f} {y1:.2f}"


def short_arc(cx, a0, a1):
    """Clockwise from a0 to a1 (a0 < a1, under 180 degrees)."""
    (x0, y0), (x1, y1) = pt(cx, a0), pt(cx, a1)
    return f"M{x0:.2f} {y0:.2f}A{R} {R} 0 0 1 {x1:.2f} {y1:.2f}"


def mark(uid, ink, amber):
    c1 = long_arc(CX[0], -40, 40)
    g = long_arc(CX[1], -40, 2) + f"H{CX[1] + 46:.2f}"
    c3 = long_arc(CX[2], -40, 40)
    # Crossings sit next to the C tips, so a tip must stay on top or it reads as a loose fragment:
    # C1 passes over G at both crossings; G and C3 weave (G over at the top tip, C3 over at the bottom).
    cut = lambda d: f'<path d="{d}" stroke="#000" stroke-width="{SW + 2 * GAP}" fill="none"/>'
    masks = {
        "a": [],
        "b": [short_arc(CX[0], -H - 18, -40), short_arc(CX[0], 40, H + 18),   # G under C1, top and bottom
              short_arc(CX[2], 180 - H - 18, 180 - H + 18)],                 # G under C3, bottom
        "c": [short_arc(CX[1], -H - 18, -40)],                               # C3 under G's top tip
    }
    defs = "".join(f'<mask id="{uid}{k}" maskUnits="userSpaceOnUse" x="0" y="0" width="460" height="230">'
                   f'<rect width="460" height="230" fill="#fff"/>{"".join(cut(d) for d in v)}</mask>' for k, v in masks.items())
    ring = lambda d, col, k: f'<path d="{d}" stroke="{col}" mask="url(#{uid}{k})"/>'
    return (f"<defs>{defs}</defs><g fill=\"none\" stroke-width=\"{SW}\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\">"
            f"{ring(c1, ink, 'a')}{ring(g, amber, 'b')}{ring(c3, ink, 'c')}</g>")


MARK_BOX = (CX[0] - R - SW / 2, CY - R - SW / 2, CX[2] + R + SW / 2, CY + R + SW / 2)   # x0 y0 x1 y1

def face(wght, wdth=100):
    f = instancer.instantiateVariableFont(TTFont(A + "fonts/archivo.woff2"), {"wght": wght, "wdth": wdth})
    return f.getGlyphSet(), f.getBestCmap(), f["OS/2"].sCapHeight


def text(txt, fnt, x0, base, cap, track):
    gs, cmap, capu = fnt
    sc = cap / capu
    pen = SVGPathPen(gs)
    bp = BoundsPen(gs)
    x = 0
    for ch in txt:
        n = cmap[ord(ch)]
        t = (sc, 0, 0, -sc, x0 + x * sc, base)
        gs[n].draw(TransformPen(pen, t))
        gs[n].draw(TransformPen(bp, t))
        x += gs[n].width + (track * 1000 if ch != " " else 0)   # track in em; Archivo upm = 1000
    return pen.getCommands(), bp.bounds


BOLD, MED = face(780, 100), face(520, 112)


def svg(view, body, label="Commercial Glazing Contractors Inc."):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" role="img" aria-label="{label}">'
            f"<title>{label}</title>{body}</svg>")


def horizontal(uid, ink, amber):
    x = MARK_BOX[2] + 44
    d1, b1 = text("COMMERCIAL GLAZING", BOLD, x, CY - 8, 50, 0.02)
    d2, b2 = text("CONTRACTORS INC.", MED, x + 2, CY + 62, 30, 0.30)
    w = max(b1[2], b2[2]) + 4
    body = mark(uid, ink, amber) + f'<g fill="{ink}"><path d="{d1}"/><path d="{d2}"/></g>'
    return svg(f"{MARK_BOX[0]:.0f} {MARK_BOX[1]:.0f} {w - MARK_BOX[0]:.0f} {MARK_BOX[3] - MARK_BOX[1]:.0f}", body)


def stacked(uid, ink, amber):
    d1, b1 = text("COMMERCIAL GLAZING", BOLD, 0, 0, 34, 0.02)
    d2, b2 = text("CONTRACTORS INC.", MED, 0, 0, 21, 0.30)
    mid = (MARK_BOX[0] + MARK_BOX[2]) / 2
    y1, y2 = MARK_BOX[3] + 66, MARK_BOX[3] + 110
    d1, b1 = text("COMMERCIAL GLAZING", BOLD, mid - (b1[2] - b1[0]) / 2 - b1[0], y1, 34, 0.02)
    d2, b2 = text("CONTRACTORS INC.", MED, mid - (b2[2] - b2[0]) / 2 - b2[0], y2, 21, 0.30)
    x0, x1 = min(MARK_BOX[0], b1[0]) - 4, max(MARK_BOX[2], b1[2]) + 4
    body = mark(uid, ink, amber) + f'<g fill="{ink}"><path d="{d1}"/><path d="{d2}"/></g>'
    return svg(f"{x0:.0f} {MARK_BOX[1]:.0f} {x1 - x0:.0f} {y2 + 6 - MARK_BOX[1]:.0f}", body)


if __name__ == "__main__":
    out = {
        "logo-v2.svg": horizontal("h", INK, AMBER),
        "logo-v2-dark.svg": horizontal("k", LIGHT, AMBER),
        "logo-v2-stacked.svg": stacked("s", INK, AMBER),
        "logo-v2-mark.svg": svg(f"{MARK_BOX[0]:.0f} {MARK_BOX[1]:.0f} {MARK_BOX[2] - MARK_BOX[0]:.0f} {MARK_BOX[3] - MARK_BOX[1]:.0f}",
                                mark("m", INK, AMBER), "CGC"),
    }
    for name, s in out.items():
        open(A + name, "w", encoding="utf-8").write(s)
        print(name, len(s))
