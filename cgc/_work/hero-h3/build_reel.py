"""Join H3 concept clips into the silent hero reel: site/assets/film/reel/ (mp4 + webm, desktop + phone crop,
posters, captions) and print the chapter list for architectural.js.

  python build_reel.py B_storefront_before_after_s101_1344x768_full A_the_lift_s101_1344x768_pdd8 ...
"""
import json, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parents[1] / "site/assets/film/reel"
FADE = 0.4
# Chapter label and caption per concept (all generated concepts, not CGC projects).
LABELS = {"A": ("Lifted into place", "A crane lifts a curtain-wall unit into an open bay"),
          "B": ("Plywood to storefront", "A boarded-up opening becomes a lit glass storefront"),
          "C": ("Lit floor by floor", "Floors light up behind a finished curtain wall"),
          "D": ("The seal", "A pane is set on blocks and sealed into its frame"),
          "E": ("One clean skin", "A mirror-glass building reflects the moving sky")}


def ff(*a):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *a], check=True)


def duration(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True, check=True)
    return float(r.stdout)


def ts(t):
    return f"00:{int(t // 60):02d}:{t % 60:06.3f}"


def main(names):
    OUT.mkdir(parents=True, exist_ok=True)
    clips = [HERE / "renders" / f"{n}.mp4" for n in names]
    durs = [duration(c) for c in clips]
    # Chain xfades: each clip starts FADE seconds before the previous one ends.
    starts, chain, prev, t = [0.0], [], "0:v", durs[0]
    for i in range(1, len(clips)):
        starts.append(t - FADE)
        chain.append(f"[{prev}][{i}:v]xfade=transition=fade:duration={FADE}:offset={t - FADE:.3f}[x{i}]")
        prev, t = f"x{i}", t - FADE + durs[i]
    graph = ";".join(chain) + f";[{prev}]format=yuv420p[v]" if chain else "[0:v]format=yuv420p[v]"
    master = OUT / "_master.mp4"
    ff(*sum((["-i", str(c)] for c in clips), []), "-filter_complex", graph, "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "14", "-preset", "slow", str(master))
    crop = "crop=432:768:456:0"
    ff("-i", str(master), "-an", "-c:v", "libx264", "-crf", "24", "-preset", "slow", "-movflags", "+faststart", str(OUT / "desktop.mp4"))
    ff("-i", str(master), "-an", "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", str(OUT / "desktop.webm"))
    ff("-i", str(master), "-an", "-vf", crop, "-c:v", "libx264", "-crf", "24", "-preset", "slow", "-movflags", "+faststart", str(OUT / "mobile.mp4"))
    ff("-i", str(master), "-an", "-vf", crop, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", str(OUT / "mobile.webm"))
    # Poster: the finished state of the first clip, just before the fade.
    pt = f"{durs[0] - FADE - 0.2:.2f}"
    ff("-ss", pt, "-i", str(master), "-frames:v", "1", "-vf", "scale=1600:-2", str(OUT / "_poster.png"))
    ff("-i", str(OUT / "_poster.png"), "-c:v", "libwebp", "-quality", "82", str(OUT / "desktop-poster.webp"))
    ff("-i", str(OUT / "_poster.png"), "-c:v", "libaom-av1", "-still-picture", "1", "-crf", "30", str(OUT / "desktop-poster.avif"))
    ff("-i", str(OUT / "_poster.png"), "-vf", "scale=768:-2", "-c:v", "libwebp", "-quality", "80", str(OUT / "desktop-poster-sm.webp"))
    ff("-i", str(OUT / "_poster.png"), "-vf", "scale=768:-2", "-c:v", "libaom-av1", "-still-picture", "1", "-crf", "32", str(OUT / "desktop-poster-sm.avif"))
    ends = starts[1:] + [t]
    vtt = "WEBVTT\n" + "".join(f"\n{ts(s)} --> {ts(e)}\n{LABELS[n[0]][1]}\n" for n, s, e in zip(names, starts, ends))
    (OUT / "captions.vtt").write_text(vtt, encoding="utf-8")
    for f in ("_master.mp4", "_poster.png"):
        (OUT / f).unlink()
    chapters = [[round(s, 2), LABELS[n[0]][0]] for n, s in zip(names, starts)]
    print("const filmChapters=" + json.dumps(chapters, separators=(",", ":")).replace('"', "'") + ";")
    print(f"total {t:.2f}s", {p.name: p.stat().st_size for p in OUT.iterdir()})


if __name__ == "__main__":
    main(sys.argv[1:])
