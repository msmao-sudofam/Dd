#!/usr/bin/env python3
"""SÍ QUEMA motion gate. Nothing reaches M Mo until it passes.

  gate.py --video final.mp4 --code animations/ --text master.srt copy.md --out verify/

What it checks:
  code   slop patterns in animation/overlay code (glow, bounce, count-up, glitch, ...)
  claims banned weight-loss / disease / fake-proof language, EN + ES, in text and code strings
  numbers every claim-shaped number must match sources.json
  disclaimer any benefit claim requires the FDA disclaimer text
  flashes  more than 3 flashes in any 1 s window fails (photosensitivity, and it's a scam tell)
  stutter  dropped-frame gaps fail; brief mid-move freezes (120-400 ms) warn
  frames   writes contact sheets to --out for Claude's visual check (step 2 of the gate)

Silence a code finding on purpose with a comment on that line:  gate: allow <rule-id>, <reason>
Exit code 1 on FAIL.
"""
import argparse
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
CODE_EXT = {".py", ".js", ".mjs", ".ts", ".tsx", ".jsx", ".html", ".css", ".svg", ".json", ".sh", ".glsl", ".frag"}
TEXT_EXT = {".srt", ".vtt", ".txt", ".md", ".json", ".csv"}

# (rule id, severity, regex, what to do instead). Matched case-insensitively, per line.
CODE_RULES = [
    ("glow", "FAIL", r"\bglow|bloom|\bneon\b|text-shadow\s*:\s*0(px)?\s+0(px)?\s|drop-shadow\(\s*0(px)?\s+0(px)?\s|box-shadow\s*:\s*0(px)?\s+0(px)?\s+\d+px|shadowBlur",
     "flat color, hairlines, real light in the shot"),
    ("blur-layer", "WARN", r"GaussianBlur|gblur|boxblur|filter\s*:\s*blur",
     "fine for a background; never as a glow on type, product, or body"),
    ("bounce", "FAIL", r"bounce|elastic|overshoot|back\.(in)?out|easeOutBack|easeInOutBack|spring\(|cubic-bezier\([^)]*(-\d|[1-9]\.\d)",
     "ease-out, settle, hold"),
    ("count-up", "FAIL", r"count[-_ ]?up|odometer|animate_?number|number.{0,20}tween|tween.{0,20}(number|value|counter)|counter\s*\+=",
     "the number is already there when the shot starts, with its source line under it"),
    ("glitch", "FAIL", r"glitch|rgb[-_ ]?split|chromatic|rgbashift|chromashift|hue[-_ ]?cycl|hue=h=|hue-rotate",
     "name it in type, or a hard cut"),
    ("orbit", "FAIL", r"\borbit|\bhalo\b|ring.{0,30}rotat|rotat.{0,30}ring",
     "a still number with its source, or the real object in focus"),
    ("shake-slam-whip", "FAIL", r"(camera|screen|cam)[-_ ]?shake|shake\s*\(|shake_?(amount|intensity|strength)|wiggle\(|whip[-_ ]?pan|\bslam|zoom[-_ ]?punch|punch[-_ ]?zoom|crash[-_ ]?zoom",
     "a real camera move, or a cut on the beat"),
    ("strobe", "FAIL", r"strobe|\bblink|countdown|\bWARNING\b",
     "calm color, never flash"),
    ("flash", "WARN", r"\bflash(ing|es)?\b",
     "a hard cut, not a flash. Check the frames."),
    ("pure-red", "WARN", r"#f00\b|#ff0000|rgb\(\s*255\s*,\s*0\s*,\s*0\b|\(\s*255\s*,\s*0\s*,\s*0\s*[,)]|0xff0000",
     "pure red reads as alarm or a 'burn zone'. Use a color sampled from the label."),
    ("particles", "FAIL", r"particle|sparkle|lens[-_ ]?flare|confetti|glitter|\bembers?\b|fire[-_ ]?(fx|particle)",
     "real heat: sweat, chalk, breath"),
    ("stock-sfx", "FAIL", r"whoosh|swoosh|chime|\bbells?\b|\bding\b|riser",
     "room tone, real foley (scoop, lid, shaker, plates), or silence. Soft clicks only."),
    ("generated-product", "WARN", r"(tub|label|packag|bottle|jar|scoop).{0,40}(generat|render|3d|prompt)|(generat|render|3d|prompt).{0,40}(tub|label|packag|bottle|jar)",
     "product visuals come only from M Mo's real photos"),
]

# Accents are stripped before matching, so "pérdida" is written "perdida".
CLAIM_FAIL = [
    ("weight-loss", r"lose weight|losing weight|weight[- ]?loss|fat[- ]?loss|burns? (body |belly )?fat|fat[- ]?burning|melts? (away )?fat|shreds? fat|"
                    r"drop \d* ?(pounds|lbs)|lose \d+ ?(lbs|pounds|kg|kilos)|slim(ming)? down|flat (belly|stomach|tummy)|belly fat|get skinny"),
    ("weight-loss-es", r"baj\w* (de )?peso|perd\w* (de )?peso|adelgaz\w*|quemar? (la )?grasa|quemagrasa|derrit\w* (la )?grasa|grasa (abdominal|corporal)|"
                       r"panza plana|abdomen plano|kilos menos|bajar \d+ ?(kilos|libras)"),
    ("disease", r"\bcures?\b|\bheals?\b|\bdiagnos\w*|diabet\w*|obesi\w*|thyroid|tiroides|cholesterol|colesterol|blood pressure|presion arterial|\bcura\b|\bcurar\b|\bprevenir\b"),
    ("fake-proof", r"clinically (proven|tested|studied)|doctor[- ]recommended|fda[- ]approved|guaranteed|guarantee results|science[- ]backed|"
                   r"aprobado por la fda|clinicamente (probado|comprobado)|garantizad\w*|resultados garantizados"),
    ("you-attribute", r"are you (overweight|fat|heavy)|hate your body|tired of your (body|belly|weight)|odias tu cuerpo|estas gord\w*"),
]
CLAIM_WARN = [
    ("label-only", r"fat burner|quemador de grasa", "only as part of the real label shot, never as a headline or VO"),
    ("treat-prevent", r"\btreats?\b|\bprevents?\b|\btrata\b", "disease-claim language. OK only for food talk ('a treat')."),
]
BENEFIT = r"\benergy\b|\benergia\b|\bfocus\b|\benfoque\b|metabolism|metabolismo|thermogenic|termogenic\w*|endurance|stamina|appetite|apetito"
DISCLAIMER = r"not been evaluated by the food and drug administration|no han sido evaluadas por la administracion de alimentos y medicamentos"
DISCLAIMER_STRIP = DISCLAIMER + r"|not intended to diagnose, treat, cure,? or prevent any disease|no esta destinado a diagnosticar, tratar, curar o prevenir ninguna enfermedad"

NUMBER = re.compile(
    r"\$\s?\d[\d,]*(\.\d+)?|#\s?1\b|\b\d[\d,]*(\.\d+)?\s?(%|x\b|mg\b|mcg\b|g\b|grams?\b|lbs?\b|pounds?\b|kg\b|kilos?\b|libras?\b|cal\b|calories\b|calorias\b|"
    r"days?\b|dias?\b|hours?\b|horas?\b|k\b|servings?\b|porciones\b|people\b|personas\b|customers\b|clientes\b)|\b\d+\s?(out of|de cada)\s?\d+",
    re.I)
SRT_NOISE = re.compile(r"^\s*\d+\s*$|-->")
STRING_LIT = re.compile(r"""(["'`])((?:\\.|(?!\1).){2,300}?)\1""")


def fold(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c)).lower()


def iter_files(paths, exts):
    for p in paths:
        p = Path(p)
        files = [p] if p.is_file() else sorted(f for f in p.rglob("*") if f.is_file()) if p.is_dir() else []
        if not p.exists():
            print(f"warning: {p} does not exist", file=sys.stderr)
        for f in files:
            if f.suffix.lower() in exts and f.stat().st_size < 2_000_000:
                yield f


class Report:
    def __init__(self):
        self.items = []  # (severity, check, where, message)

    def add(self, sev, check, where, msg):
        self.items.append((sev, check, where, msg))

    def count(self, sev):
        return sum(1 for i in self.items if i[0] == sev)


# ---------- code ----------

def check_code(paths, rep):
    strings = []  # (where, text) quoted strings = candidate on-screen text
    n = 0
    for f in iter_files(paths, CODE_EXT):
        n += 1
        for ln, line in enumerate(f.read_text(errors="replace").splitlines(), 1):
            where = f"{f}:{ln}"
            allowed = re.findall(r"gate:\s*allow\s+([\w-]+)", line)
            for rid, sev, rx, fix in CODE_RULES:
                if rid in allowed:
                    continue
                m = re.search(rx, line, re.I)
                if m:
                    rep.add(sev, f"code/{rid}", where, f"`{m.group(0).strip()}` → instead: {fix}")
            for m in STRING_LIT.finditer(line):
                s = m.group(2)
                if re.search(r"[a-zA-Z]{2,}\s+\S", s) or NUMBER.search(s):
                    strings.append((where, s))
    return n, strings


# ---------- claims, numbers, disclaimer ----------

def read_text_units(paths):
    units = []
    for f in iter_files(paths, TEXT_EXT):
        for ln, line in enumerate(f.read_text(errors="replace").splitlines(), 1):
            if line.strip() and not SRT_NOISE.search(line):
                units.append((f"{f}:{ln}", line))
    return units


def load_sources():
    data = json.loads((SKILL / "sources.json").read_text())
    matches = {}
    for e in data["entries"]:
        for m in e["match"]:
            matches[re.sub(r"\s", "", m.lower())] = e["id"]
    ignore = {re.sub(r"\s", "", i.lower()) for i in data.get("ignore_numbers", []) if not i.startswith("_")}
    return matches, ignore


def digits(s):
    return re.sub(r"[^\d.]", "", s).strip(".")


def check_claims(units, rep, disclaimer_in_video):
    matches, ignore = load_sources()
    match_digits = {digits(k): v for k, v in matches.items() if digits(k)}
    all_text = fold(" ".join(t for _, t in units))
    has_disclaimer = re.search(DISCLAIMER, all_text) is not None
    benefit_hits = []
    for where, text in units:
        t = re.sub(DISCLAIMER_STRIP, " ", fold(text))
        for rid, rx in CLAIM_FAIL:
            m = re.search(rx, t)
            if m:
                rep.add("FAIL", f"claims/{rid}", where, f"\"{m.group(0)}\" can't be said. See compliance.md.")
        for rid, rx, why in CLAIM_WARN:
            m = re.search(rx, t)
            if m:
                rep.add("WARN", f"claims/{rid}", where, f"\"{m.group(0)}\": {why}")
        m = re.search(BENEFIT, t)
        if m:
            benefit_hits.append((where, m.group(0)))
        for m in NUMBER.finditer(text):
            tok = re.sub(r"\s", "", m.group(0).lower())
            if tok in ignore or digits(tok) in ignore:
                continue
            src = matches.get(tok) or match_digits.get(digits(tok))
            if not src:
                rep.add("FAIL", "numbers/unsourced", where, f"\"{m.group(0)}\" has no entry in sources.json. No source, no number.")
    if benefit_hits:
        where, word = benefit_hits[0]
        extra = f" (+{len(benefit_hits) - 1} more)" if len(benefit_hits) > 1 else ""
        if has_disclaimer:
            rep.add("PASS", "disclaimer", where, f"benefit claim \"{word}\"{extra}; FDA disclaimer present")
        elif disclaimer_in_video:
            rep.add("WARN", "disclaimer", where, f"benefit claim \"{word}\"{extra}; disclaimer said to be burned into the video. Confirm it on the contact sheet (readable, ≥2 s).")
        else:
            rep.add("FAIL", "disclaimer", where, f"benefit claim \"{word}\"{extra} but no FDA disclaimer in any text. Add the disclaimer end card (compliance.md).")


# ---------- video ----------

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def probe_duration(video):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(video)])
    try:
        return float(r.stdout.strip())
    except ValueError:
        sys.exit(f"can't read video: {video}\n{r.stderr}")


def check_flashes(video, rep, threshold=25.0):
    """A flash = a luma jump and its reversal. WCAG 2.3.1: no more than 3 flashes in any 1 s."""
    r = run(["ffmpeg", "-v", "error", "-i", str(video), "-vf", "scale=160:-2,signalstats,metadata=print:file=-", "-an", "-f", "null", "-"])
    times, lumas, t = [], [], None
    for line in r.stdout.splitlines():
        m = re.search(r"pts_time:([\d.]+)", line)
        if m:
            t = float(m.group(1))
        m = re.search(r"lavfi\.signalstats\.YAVG=([\d.]+)", line)
        if m and t is not None:
            times.append(t)
            lumas.append(float(m.group(1)))
    if len(lumas) < 2:
        rep.add("WARN", "flashes", str(video), "couldn't read luma; check flashing by eye")
        return
    jumps = []  # (time, direction)
    for i in range(1, len(lumas)):
        d = lumas[i] - lumas[i - 1]
        if abs(d) >= threshold:
            jumps.append((times[i], 1 if d > 0 else -1))
    flashes = [jumps[i][0] for i in range(1, len(jumps)) if jumps[i][1] != jumps[i - 1][1] and jumps[i][0] - jumps[i - 1][0] <= 0.5]
    worst, at = 0, None
    for i, ft in enumerate(flashes):
        n = sum(1 for x in flashes[i:] if x - ft < 1.0)
        if n > worst:
            worst, at = n, ft
    if worst > 3:
        rep.add("FAIL", "flashes", f"{video}@{at:.2f}s", f"{worst} flashes within 1 s (max 3). Calm color, never flash.")
    elif worst >= 2:
        rep.add("WARN", "flashes", f"{video}@{at:.2f}s", f"{worst} flashes within 1 s. Allowed, but check that it's a cut and not a strobe.")
    else:
        rep.add("PASS", "flashes", str(video), f"max {worst} flash(es) in any 1 s window")


def check_stutter(video, rep):
    """Stutters: dropped frames (timestamp gaps) and brief freezes (a held frame mid-motion)."""
    r = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "frame=pts_time", "-of", "csv=p=0", str(video)])
    pts = sorted(float(x) for x in r.stdout.split() if x.replace(".", "", 1).isdigit())
    if len(pts) > 2:
        deltas = [b - a for a, b in zip(pts, pts[1:])]
        nominal = sorted(deltas)[len(deltas) // 2]
        gaps = [(pts[i + 1], d) for i, d in enumerate(deltas) if nominal and d > 1.6 * nominal]
        if gaps:
            first = ", ".join(f"{t:.2f}s" for t, _ in gaps[:5])
            rep.add("FAIL", "stutter/dropped", str(video), f"{len(gaps)} dropped-frame gap(s) at {first}. Re-render at a constant frame rate.")
    r = run(["ffmpeg", "-v", "info", "-i", str(video), "-vf", "freezedetect=n=0.002:d=0.12", "-an", "-f", "null", "-"])
    starts = [float(m) for m in re.findall(r"freeze_start: ([\d.]+)", r.stderr)]
    durs = [float(m) for m in re.findall(r"freeze_duration: ([\d.]+)", r.stderr)]
    brief = [(s, d) for s, d in zip(starts, durs) if d < 0.4]
    if brief:
        where = ", ".join(f"{s:.2f}s ({d * 1000:.0f}ms)" for s, d in brief[:5])
        rep.add("WARN", "stutter/freeze", str(video), f"{len(brief)} brief freeze(s) at {where}. Check these frames: a hold on purpose is fine, a hitch mid-move is not.")
    if not any(c.startswith("stutter") for _, c, _, _ in rep.items):
        rep.add("PASS", "stutter", str(video), "constant frame timing, no brief freezes")


def contact_sheets(video, out, duration, every=1.0):
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob("sheet_*.jpg"):
        old.unlink()
    cols, rows = 6, 4
    run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-vf",
         f"fps=1/{every},scale=260:-2,drawtext=text='%{{pts\\:hms}}':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6,tile={cols}x{rows}",
         str(out / "sheet_%02d.jpg")])
    sheets = sorted(out.glob("sheet_*.jpg"))
    if not sheets:  # drawtext needs a font; retry without timestamps
        run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-vf", f"fps=1/{every},scale=260:-2,tile={cols}x{rows}", str(out / "sheet_%02d.jpg")])
        sheets = sorted(out.glob("sheet_*.jpg"))
    return sheets


# ---------- main ----------

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--video", help="the render that will ship")
    ap.add_argument("--code", nargs="*", default=[], help="animation/overlay code files or dirs")
    ap.add_argument("--text", nargs="*", default=[], help="captions (.srt), VO script, on-screen copy")
    ap.add_argument("--out", default="verify", help="where the report and contact sheets go")
    ap.add_argument("--disclaimer-in-video", action="store_true", help="the FDA disclaimer is burned in from a source not passed via --text")
    args = ap.parse_args()
    if not (args.video or args.code or args.text):
        ap.error("give at least one of --video, --code, --text")

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    rep = Report()

    n_code, code_strings = check_code(args.code, rep)
    units = read_text_units(args.text) + code_strings
    check_claims(units, rep, args.disclaimer_in_video)

    sheets = []
    if args.video:
        dur = probe_duration(args.video)
        check_flashes(args.video, rep)
        check_stutter(args.video, rep)
        sheets = contact_sheets(args.video, out, dur, every=max(0.5, min(2.0, dur / 48)))

    fails, warns = rep.count("FAIL"), rep.count("WARN")
    verdict = "FAIL" if fails else "PASS"
    summary = f"MOTION GATE: {verdict} · {fails} fail · {warns} warn · {n_code} code files · {len(units)} text lines" + (f" · {len(sheets)} contact sheet(s)" if args.video else "")

    lines = [f"# {summary}", ""]
    for sev in ("FAIL", "WARN", "PASS"):
        group = [i for i in rep.items if i[0] == sev]
        if group:
            lines.append(f"## {sev}")
            lines += [f"- **{c}** `{w}`: {m}" for _, c, w, m in group]
            lines.append("")
    lines.append("## Visual check (Claude fills this in)")
    if sheets:
        lines.append("Open each contact sheet and check every frame against slop.md + principles.md + compliance.md:")
        lines += [f"- [ ] `{s}`" for s in sheets]
        lines += ["", "Checklist: no glow/orbit/particles · no AI product or AI people · no body scan or before/after ·",
                  "every on-screen number is in sources.json · disclaimer readable ≥2 s if any benefit claim ·",
                  "type sits in the scene · colors from the label · nothing flashing red.", "", "Result: _PASS / FAIL + notes_"]
    else:
        lines.append("_No video given. Run again with --video before showing anything to M Mo._")
    report = out / "gate_report.md"
    report.write_text("\n".join(lines) + "\n")

    print(summary)
    for sev, c, w, m in rep.items:
        if sev != "PASS":
            print(f"  {sev} {c} {w}: {m}")
    for s in sheets:
        print(f"  sheet: {s}")
    print(f"  report: {report}")
    if sheets:
        print("  next: open the contact sheets and fill in 'Visual check' before presenting.")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
