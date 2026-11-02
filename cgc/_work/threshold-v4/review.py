"""Review sheet + motion measurements for each H3 render.

For each clip: first / quarter / middle / three-quarter / last frames in one strip, plus
tracked-feature motion relative to frame 0:
  tx, ty   median feature shift in % of width / height (+x = content moves right on screen)
  scale    similarity-fit scale (>1 = content grows: push-in / zoom)
  spread   spread of per-feature horizontal shift / |median shift|. A real truck has depth
           parallax (near features move more than far ones) -> clearly > 0. A whole-frame 2D
           pan of one still -> ~0.
  still    mean absolute frame difference over the clip (near 0 = frozen / held plate)
Numbers support, not replace, watching the clip and reading the strip.

  python review.py renders/S03_*.mp4
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np

HERE = Path(__file__).resolve().parent
OUT = HERE / "review"


def frames(path):
    cap = cv2.VideoCapture(str(path))
    out = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        out.append(f)
    return out


def track(f0, f1):
    g0, g1 = (cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in (f0, f1))
    p0 = cv2.goodFeaturesToTrack(g0, 600, 0.01, 8)
    if p0 is None:
        return None
    p1, st, _ = cv2.calcOpticalFlowPyrLK(g0, g1, p0, None, winSize=(31, 31), maxLevel=4)
    ok = st.ravel() == 1
    a, b = p0[ok].reshape(-1, 2), p1[ok].reshape(-1, 2)
    if len(a) < 12:
        return None
    m, inl = cv2.estimateAffinePartial2D(a, b, ransacReprojThreshold=3)
    d = b - a
    h, w = g0.shape
    med = np.median(d, axis=0)
    scale = float(np.hypot(m[0, 0], m[1, 0])) if m is not None else 1.0
    spread = float((np.percentile(d[:, 0], 90) - np.percentile(d[:, 0], 10)) / max(abs(float(med[0])), 0.5))
    return dict(tx=round(float(100 * med[0] / w), 2), ty=round(float(100 * med[1] / h), 2),
                scale=round(scale, 4), spread=round(spread, 2), n=int(len(a)))


def review(path):
    path = Path(path)
    fs = frames(path)
    n = len(fs)
    idx = [0, n // 4, n // 2, 3 * n // 4, n - 1]
    h, w = fs[0].shape[:2]
    tw = 416
    th = int(h * tw / w)
    strip = np.zeros((th + 22, tw * 5, 3), np.uint8)
    for k, i in enumerate(idx):
        strip[22:, k * tw:(k + 1) * tw] = cv2.resize(fs[i], (tw, th), interpolation=cv2.INTER_AREA)
        cv2.putText(strip, f"f{i}", (k * tw + 6, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
    OUT.mkdir(exist_ok=True)
    cv2.imwrite(str(OUT / f"{path.stem}.jpg"), strip, [cv2.IMWRITE_JPEG_QUALITY, 88])
    motion = {f"f{i}": track(fs[0], fs[i]) for i in idx[1:]}
    still = float(np.mean([cv2.absdiff(fs[i], fs[i + 1]).mean() for i in range(0, n - 1, 4)]))
    rep = dict(clip=path.name, frames=n, size=[w, h], motion_vs_f0=motion, mean_frame_diff=round(still, 2))
    (OUT / f"{path.stem}.json").write_text(json.dumps(rep, indent=2), encoding="utf-8")
    return rep


if __name__ == "__main__":
    for p in sys.argv[1:]:
        print(json.dumps(review(p)))
