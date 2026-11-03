"""More CGC logo directions next to v2. Writes SVGs to _work/logo-explore/ (not used by the site).

  python logo_explore.py
"""
from pathlib import Path
import logo_v2 as L

OUT = Path(__file__).resolve().parent / "logo-explore"
INK, AMBER, STEEL, GLASS = L.INK, L.AMBER, "#39586C", "#DCE7EC"
BLACK = L.face(900, 125)                     # Archivo Black Expanded
HEAVY = L.face(900, 100)


def lockup(mark_svg, mark_w, mark_h, ink=INK, gap=44, cap1=50, cap2=30, y1=None):
    y1 = y1 if y1 is not None else mark_h / 2 - 8
    d1, b1 = L.text("COMMERCIAL GLAZING", L.BOLD, mark_w + gap, y1, cap1, 0.02)
    d2, b2 = L.text("CONTRACTORS INC.", L.MED, mark_w + gap + 2, y1 + 70, cap2, 0.30)
    w = max(b1[2], b2[2]) + 4
    return L.svg(f"0 0 {w:.0f} {mark_h:.0f}", mark_svg + f'<g fill="{ink}"><path d="{d1}"/><path d="{d2}"/></g>')


def letters(txt, x, base, cap, track=0.0, fnt=BLACK):
    return L.text(txt, fnt, x, base, cap, track)


# 1. Pane: the woven rings set in a rounded glass pane with a diagonal glint (app-icon ready).
def pane():
    s, pad = 228, 0
    ring_scale = 0.5
    m = (f'<rect x="2" y="2" width="{s - 4}" height="{s - 4}" rx="36" fill="{GLASS}" stroke="{INK}" stroke-width="4"/>'
         f'<path d="M24 74 L74 24" stroke="#fff" stroke-width="12" stroke-linecap="round"/>'
         f'<g transform="translate({(s - 412 * ring_scale) / 2 - 12 * ring_scale:.1f} {(s - 204 * ring_scale) / 2 - 12 * ring_scale:.1f}) scale({ring_scale})">'
         f'{L.mark("p", INK, AMBER)}</g>')
    return lockup(m, s, s, y1=s / 2 - 10)


# 2. Monoline: the same weave, thinner and lighter, for a more architectural, premium feel.
def monoline():
    sw, L.SW = L.SW, 12
    gap, L.GAP = L.GAP, 7
    m = L.mark("o", INK, AMBER)
    L.SW, L.GAP = sw, gap
    return lockup(f'<g transform="translate(-12 -12)">{m}</g>', 412, 204)


# 3. Wordmark: CGC as heavy expanded letters, amber G, no rings. Loudest, matches the site headline.
def wordmark():
    d1, b1 = letters("CG", 0, 150, 150, 0.01)
    dc, bc = letters("C", 0, 150, 150)
    dg, bg = letters("G", 0, 150, 150)
    xg = bc[2] + 10
    dg, bg = letters("G", xg - bg[0], 150, 150)
    xc = bg[2] + 10
    dc2, bc2 = letters("C", xc - bc[0], 150, 150)
    m = f'<g fill="{INK}"><path d="{dc}"/><path d="{dc2}"/></g><path fill="{AMBER}" d="{dg}"/>'
    return lockup(m, bc2[2], 204, y1=95)


# 4. Storefront: C, G, C as three glass panes in one graphite frame with mullions; amber G pane.
def storefront():
    pw, ph, fr = 118, 190, 12
    x = fr
    body = f'<rect x="{fr / 2}" y="{fr / 2}" width="{3 * pw + 4 * fr - fr}" height="{ph + fr}" fill="none" stroke="{INK}" stroke-width="{fr}"/>'
    for i, ch in enumerate("CGC"):
        px = fr + i * (pw + fr)
        if i:
            body += f'<rect x="{px - fr}" y="{fr / 2}" width="{fr}" height="{ph + fr}" fill="{INK}"/>'
        body += f'<rect x="{px}" y="{fr}" width="{pw}" height="{ph}" fill="{AMBER if ch == "G" else GLASS}"/>'
        d, b = letters(ch, 0, 0, 84, fnt=HEAVY)
        d, b = letters(ch, px + (pw - (b[2] - b[0])) / 2 - b[0], fr + ph / 2 + 42, 84, fnt=HEAVY)
        body += f'<path fill="{INK}" d="{d}"/>'
    for i in (0, 2):
        gx = fr + i * (pw + fr)
        body += f'<path d="M{gx + 14} {fr + 46} L{gx + 46} {fr + 14}" stroke="#fff" stroke-width="7" stroke-linecap="round"/>'
    return lockup(body, 3 * pw + 4 * fr, ph + 2 * fr, y1=(ph + 2 * fr) / 2 - 8)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for name, fn in [("1-pane", pane), ("2-monoline", monoline), ("3-wordmark", wordmark), ("4-storefront", storefront)]:
        (OUT / f"{name}.svg").write_text(fn(), encoding="utf-8")
        print(name)
