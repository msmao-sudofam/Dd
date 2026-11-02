"""Render Threshold v4 shots with MiniMax H3 FL2VA Pruned through WanGP's in-process API.

Prompts come verbatim from the v4 shot cards (cgc/creative/freebuff-h3-redo-v4/shot-cards.py).
Native output only: no upscaling, interpolation or post-processing here.

Run from the WanGP app dir:
  C:/pinokio/api/wan.git/app/venv/Scripts/python.exe render_h3.py --job S03:S03_joint_final.png:7301 --job S05:S05b_door_ajar_v01.png:7501
"""
import argparse, json, runpy, shutil, sys, time
from pathlib import Path

APP = Path("C:/pinokio/api/wan.git/app")
sys.path.insert(0, str(APP))
HERE = Path(__file__).resolve().parent
CGC = HERE.parents[1]
KF = [HERE / "keyframes", CGC / "_work/threshold-v3/01_keyframes"]
OUT = HERE / "renders"
LOG = HERE / "render-log.json"

g = runpy.run_path(str(CGC / "creative/freebuff-h3-redo-v4/shot-cards.py"))
CARDS = {f"S{c['id']}": c for c in next(v for v in g.values() if isinstance(v, list) and v and isinstance(v[0], dict))}


def keyframe(name):
    for d in KF:
        if (d / name).exists():
            return d / name
    raise FileNotFoundError(name)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--job", action="append", required=True, help="SHOT:keyframe.png:seed[:end=last.png][:prompt=file.txt]")
    ap.add_argument("--frames", type=int, default=124)
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    from shared.api import init
    session = init(console_output=False)
    for job in a.job:
        parts = job.split(":")
        shot, kf, seed = parts[0], keyframe(parts[1]), int(parts[2])
        opts = dict(x.split("=", 1) for x in parts[3:])
        prompt = Path(opts["prompt"]).read_text(encoding="utf-8") if "prompt" in opts else CARDS[shot]["h3_prompt"]
        end = keyframe(opts["end"]) if "end" in opts else None
        tag = f"{shot}_{kf.stem}_s{seed}" + ("_FL" if end else "")
        s = session.get_default_settings("minimax_h3_fl2va_pruned")
        s.update({"model_type": "minimax_h3_fl2va_pruned", "prompt": prompt, "image_prompt_type": "S",
                  "image_start": [str(kf)], "resolution": "832x480", "video_length": a.frames,
                  "num_inference_steps": 20, "seed": seed, "prompt_enhancer": "", "output_filename": tag})
        if end:
            s.update({"image_prompt_type": "SE", "image_end": [str(end)]})
        print(f"=== {tag}", flush=True)
        t0 = time.time()
        r = session.run_task(s)
        el = time.time() - t0
        kept = []
        for f in (r.generated_files or []):
            p = Path(f)
            if p.exists() and p.suffix.lower() == ".mp4":
                dst = OUT / f"{tag}.mp4"
                shutil.copyfile(p, dst)
                kept.append(str(dst))
        rec = dict(shot=shot, keyframe=str(kf), end_frame=str(end) if end else None, seed=seed, frames=a.frames, elapsed_s=round(el, 1), outputs=kept,
                   errors=[str(e) for e in (r.errors or [])], prompt=prompt,
                   settings={k: s.get(k) for k in ("resolution", "video_length", "num_inference_steps", "guidance_scale", "sample_solver", "flow_shift")},
                   at=time.strftime("%Y-%m-%dT%H:%M:%S"))
        log = json.loads(LOG.read_text(encoding="utf-8")) if LOG.exists() else []
        log.append(rec)
        LOG.write_text(json.dumps(log, indent=2), encoding="utf-8")
        print(f"    {el:.0f}s -> {kept} {rec['errors']}", flush=True)


if __name__ == "__main__":
    main()
