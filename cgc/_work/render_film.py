"""Assemble generated Wan 2.2 concept shots into the website intro film.

Source clips are silent 1280x704, 121 frames, 24fps. Output keeps the existing
wide.mp4 / portrait.mp4 contract used by the site player. Generated visuals are
concept illustrations, never evidence of a completed CGC project.
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "_work/film-raw"
OUT = ROOT / "site/assets/film"
W, H = 1600, 900
PW, PH = 720, 1100

# order, source, seconds, portrait crop x (of 1280-460), caption
SHOTS = [
    ("b01", 3.2, 410, "A world in the edge. Sunlight and reflections at the glass entrance."),
    ("b02", 3.2, 300, "The moving mirror. Clouds and the white facade shift in reflection."),
    ("b03", 3.2, 360, "Reflection becomes a place. The open glass entrance and sunlit lobby."),
    ("b05", 3.2, 580, "The invisible corner. Reflections resolve into a clear conference room."),
    ("b06", 3.2, 410, "Reveal the building. The completed facade in clear afternoon light."),
]
GRADE = ("eq=contrast=1.05:saturation=0.9:brightness=-0.012,"
         "colorbalance=bs=.025:bm=.012:bh=-.01,"
         "noise=alls=2:allf=t+u")
FPS = 24
START = 12  # skip the stiff first half-second of each generation


def run(cmd):
    print(" ".join(map(str, cmd))[:240])
    subprocess.run(cmd, check=True)


def enc_wide():
    inputs = []
    for name, dur, _, _ in SHOTS:
        src = RAW / f"{name}.mp4"
        if not src.exists():
            sys.exit(f"missing generated clip: {src}")
        inputs += ["-i", str(src)]
    n = len(SHOTS)
    parts = []
    for i, (name, dur, _, _) in enumerate(SHOTS):
        parts.append(
            f"[{i}:v]fps={FPS},trim=start_frame={START}:end_frame={START + round(dur * FPS)},"
            f"setpts=PTS-STARTPTS,scale=1636:900:flags=lanczos,crop={W}:{H},{GRADE}[v{i}]"
        )
    filt = ";".join(parts) + ";" + "".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[cat];"
    # Editorial white fade, then a restrained final hold.
    filt += f"[cat]fade=t=in:st=0:d=0.3:color=white,fade=t=out:st=15.6:d=0.4:color=white[v]"
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", filt, "-map", "[v]",
         "-r", str(FPS), "-an", "-c:v", "libx264", "-preset", "slower", "-crf", "28",
         "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT / "wide.mp4")])


def enc_portrait():
    inputs = []
    for name, dur, _, _ in SHOTS:
        inputs += ["-i", str(RAW / f"{name}.mp4")]
    n = len(SHOTS)
    parts = []
    for i, (name, dur, x, _) in enumerate(SHOTS):
        parts.append(
            f"[{i}:v]fps={FPS},trim=start_frame={START}:end_frame={START + round(dur * FPS)},"
            f"setpts=PTS-STARTPTS,crop=460:704:{x}:0,scale={PW}:{PH}:flags=lanczos,{GRADE}[v{i}]"
        )
    filt = ";".join(parts) + ";" + "".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[cat];"
    filt += "[cat]fade=t=in:st=0:d=0.3:color=white,fade=t=out:st=15.6:d=0.4:color=white[v]"
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", filt, "-map", "[v]",
         "-r", str(FPS), "-an", "-c:v", "libx264", "-preset", "slower", "-crf", "28",
         "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT / "portrait.mp4")])


def poster(src, dst, size):
    run(["ffmpeg", "-y", "-v", "error", "-ss", "0.6", "-i", str(src), "-frames:v", "1",
         "-vf", f"scale={size[0]}:{size[1]}:flags=lanczos", "-q:v", "86", str(dst)])


def fmt(sec):
    whole = int(sec)
    return f"00:{whole:02d}.{round((sec - whole) * 1000):03d}"


def captions():
    lines = ["WEBVTT", ""]
    t = 0.0
    for i, (_, dur, _, text) in enumerate(SHOTS):
        a = fmt(t)
        b = fmt(t + dur)
        if i == 0:
            text = "Generated concept film. Illustrative visualization, not a completed CGC project. " + text
        lines += [f"{a} --> {b}", text, ""]
        t += dur
    with open(OUT / "captions.vtt", "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines))


def edit_json():
    data = {
        "duration": 16,
        "audio": False,
        "source": "Generated concept film: local Wan 2.2 5B image-to-video from the CGC storyboard keyframes",
        "disclosure": "Illustrative generated concept. Not a completed CGC project and not evidence of installed work.",
        "shots": [
            {"shot": name, "start": round(i * 3.2, 2), "duration": 3.2,
             "description": text, "keyframe": ("site/assets/concepts/office-after.webp" if name == "b05" else
                          "creative/video-concepts-2026-10-31/entrance-light.png" if name in ("b01", "b03") else
                          "creative/video-concepts-2026-10-31/curtain-wall-after.png")}
            for i, (name, _dur, _x, text) in enumerate(SHOTS)
        ],
    }
    (OUT / "edit.json").write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    enc_wide()
    enc_portrait()
    poster(OUT / "wide.mp4", OUT / "wide-poster.webp", (W, H))
    poster(OUT / "portrait.mp4", OUT / "portrait-poster.webp", (PW, PH))
    captions()
    edit_json()
    print("wrote wide.mp4, portrait.mp4, posters, captions, edit.json")
