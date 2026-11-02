"""Assemble and install THE THRESHOLD v4 from accepted H3 renders.

accepted.json lists, per shot, the accepted native render and the first frame of its
two-second segment. Every segment is 48 consecutive native 24fps frames: no speed change,
interpolation, freeze, reverse or digital zoom beyond the fixed per-shot framing crop.

Desktop 1600x900: 832x480 source cropped to 16:9 (832x468), Lanczos upscale.
Phone 720x1280: a fixed 9:16 window (270x480) placed per shot by `phone_x` (0..1 centre),
Lanczos upscale. The crop window never moves within a shot.

Refuses to run unless all eight shots are present and marked "pass".

  python assemble.py            # build into web/
  python assemble.py --install  # also copy to cgc/site/assets/film/threshold-v4/
"""
import argparse
import json
import shutil
import subprocess
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
WEB = HERE / "web"
EDIT = HERE / "edit"
DEST = HERE.parents[1] / "site/assets/film/threshold-v4"
RATE, SEG = 24, 48
SHOTS = ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08"]


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit(f"failed: {' '.join(map(str, cmd))}\n{p.stderr[-1500:]}")


def segment(shot, a, desktop):
    src = HERE / a["clip"]
    sel = f"select='between(n\\,{a['start']}\\,{a['start'] + SEG - 1})',setpts=N/{RATE}/TB"
    if desktop:
        vf = f"{sel},crop=832:468:0:(ih-468)/2,scale=1600:900:flags=lanczos,setsar=1"
        dst = EDIT / f"{shot}_desktop.mp4"
    else:
        x = max(0, min(832 - 270, round(a.get("phone_x", 0.5) * 832 - 135)))
        vf = f"{sel},crop=270:480:{x}:0,scale=720:1280:flags=lanczos,setsar=1"
        dst = EDIT / f"{shot}_mobile.mp4"
    run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-vf", vf, "-r", str(RATE), "-frames:v", str(SEG),
         "-an", "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-pix_fmt", "yuv420p", str(dst)])
    return dst


def join(parts, out, crf):
    lst = EDIT / f"{out.stem}.txt"
    lst.write_text("".join(f"file '{p.as_posix()}'\n" for p in parts), encoding="utf-8")
    master = EDIT / f"{out.stem}-master.mp4"
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(master)])
    run(["ffmpeg", "-y", "-v", "error", "-i", str(master), "-c:v", "libx264", "-crf", str(crf), "-preset", "slow",
         "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", str(out)])
    run(["ffmpeg", "-y", "-v", "error", "-i", str(out), "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0",
         "-row-mt", "1", "-an", str(out.with_suffix(".webm"))])


def ts(t):
    return f"00:00:{t:06.3f}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--install", action="store_true")
    args = ap.parse_args()
    acc = json.loads((HERE / "accepted.json").read_text(encoding="utf-8"))
    missing = [s for s in SHOTS if acc.get(s, {}).get("verdict") != "pass"]
    if missing:
        raise SystemExit(f"not all shots accepted: {missing}")
    EDIT.mkdir(exist_ok=True)
    WEB.mkdir(exist_ok=True)
    join([segment(s, acc[s], True) for s in SHOTS], WEB / "desktop.mp4", 24)
    join([segment(s, acc[s], False) for s in SHOTS], WEB / "mobile.mp4", 24)

    vtt = ["WEBVTT", ""]
    for i, s in enumerate(SHOTS):
        vtt += [f"{ts(i * 2)} --> {ts(i * 2 + 2)}", acc[s]["caption"], ""]
    (WEB / "captions.vtt").write_text("\n".join(vtt), encoding="utf-8")

    for clip, stem in (("desktop.mp4", "desktop"), ("mobile.mp4", "mobile")):
        frame = EDIT / f"_{stem}.png"
        run(["ffmpeg", "-y", "-v", "error", "-i", str(WEB / clip), "-frames:v", "1", str(frame)])
        img = Image.open(frame).convert("RGB")
        img.save(WEB / f"{stem}-poster.webp", quality=86, method=6)
        if stem == "desktop":
            img.save(WEB / "desktop-poster.avif", quality=52)
            sm = img.resize((768, 432), Image.LANCZOS)
            sm.save(WEB / "desktop-poster-sm.webp", quality=84, method=6)
            sm.save(WEB / "desktop-poster-sm.avif", quality=50)
        frame.unlink()

    edit = dict(title="THE THRESHOLD v4", note="Generated concept film, not a CGC project. Silent, 16 s, 24 fps.",
                model="MiniMax H3 FL2VA Pruned 20B (minimax_h3_fl2va_pruned) via WanGP, native 832x480 24fps",
                upscale="Lanczos to 1600x900 (desktop) and 720x1280 (phone crop); no interpolation",
                shots=[dict(shot=s, start_s=i * 2, **acc[s]) for i, s in enumerate(SHOTS)])
    (WEB / "edit.json").write_text(json.dumps(edit, indent=2), encoding="utf-8")

    if args.install:
        DEST.mkdir(parents=True, exist_ok=True)
        for p in WEB.iterdir():
            shutil.copyfile(p, DEST / p.name)
    for p in sorted(WEB.iterdir()):
        print(f"  {p.name:26s} {p.stat().st_size / 1024:8.1f} KB")


if __name__ == "__main__":
    main()
