"""CGC logo v3, elegant: the v2 woven rings drawn fine, a softer gold G, and a light, widely tracked wordmark
with a hairline rule. Outputs site/assets/logo-v3.svg, -dark, -stacked, -mark.

  python logo_v3.py
"""
import logo_v2 as L

INK, GOLD, LIGHT = "#1B2329", "#C99A3E", "#FFFFFF"
L.SW, L.GAP = 11, 4
L.MARK_BOX = (L.CX[0] - L.R - L.SW / 2, L.CY - L.R - L.SW / 2, L.CX[2] + L.R + L.SW / 2, L.CY + L.R + L.SW / 2)
NAME, SUB = L.face(430, 108), L.face(380, 100)
B = L.MARK_BOX


def words(x, y, cap1=44, cap2=21, center=None):
    d1, b1 = L.text("COMMERCIAL GLAZING", NAME, 0, 0, cap1, 0.16)
    d2, b2 = L.text("CONTRACTORS  INC.", SUB, 0, 0, cap2, 0.42)
    w = b1[2] - b1[0]
    x0 = center - w / 2 if center is not None else x
    d1, b1 = L.text("COMMERCIAL GLAZING", NAME, x0 - b1[0], y, cap1, 0.16)
    x2 = (center - (b2[2] - b2[0]) / 2 if center is not None else x0) - b2[0]
    d2, b2 = L.text("CONTRACTORS  INC.", SUB, x2, y + cap1 + 2 * cap2 + 8, cap2, 0.42)
    ry = y + cap1 / 2 + cap2 - 2
    rule = (f'<rect x="{b1[0]:.1f}" y="{ry:.1f}" width="{b1[2] - b1[0]:.1f}" height="1.6"/>')
    return f"<path d=\"{d1}\"/>{rule}<path d=\"{d2}\"/>", b1, b2


def horizontal(uid, ink, gold):
    body, b1, b2 = words(B[2] + 52, L.CY - 18)
    w = max(b1[2], b2[2]) + 4
    return L.svg(f"{B[0]:.0f} {B[1]:.0f} {w - B[0]:.0f} {B[3] - B[1]:.0f}", L.mark(uid, ink, gold) + f'<g fill="{ink}">{body}</g>')


def stacked(uid, ink, gold):
    mid = (B[0] + B[2]) / 2
    body, b1, b2 = words(0, B[3] + 78, 34, 16, center=mid)
    x0, x1 = min(B[0], b1[0]) - 6, max(B[2], b1[2]) + 6
    return L.svg(f"{x0:.0f} {B[1]:.0f} {x1 - x0:.0f} {b2[3] + 8 - B[1]:.0f}", L.mark(uid, ink, gold) + f'<g fill="{ink}">{body}</g>')


if __name__ == "__main__":
    out = {"logo-v3.svg": horizontal("e", INK, GOLD), "logo-v3-dark.svg": horizontal("d", LIGHT, GOLD),
           "logo-v3-stacked.svg": stacked("t", INK, GOLD),
           "logo-v3-mark.svg": L.svg(f"{B[0]:.0f} {B[1]:.0f} {B[2] - B[0]:.0f} {B[3] - B[1]:.0f}", L.mark("n", INK, GOLD), "CGC")}
    for name, s in out.items():
        open(L.A + name, "w", encoding="utf-8").write(s)
        print(name, len(s))
