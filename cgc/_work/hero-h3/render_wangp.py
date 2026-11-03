"""Draft H3 hero concepts in WanGP (same H3 FL2VA pruned weights as ComfyUI) while the Comfy text encoder downloads.

Default is the PDD 8-step draft variant; --full uses the 20-step base model.
Run with WanGP's venv:
  C:/pinokio/api/wan.git/app/venv/Scripts/python.exe render_wangp.py A_the_lift B_storefront_before_after --seed 101
"""
import argparse, json, shutil, sys, time
from pathlib import Path

APP = Path("C:/pinokio/api/wan.git/app")
sys.path.insert(0, str(APP))
HERE = Path(__file__).resolve().parent
PROMPTS = HERE.parents[1] / "creative/hero-concepts-h3/prompts"
OUT = HERE / "renders"
LOG = HERE / "render-log.json"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("concepts", nargs="+")
    ap.add_argument("--seed", type=int, default=101)
    ap.add_argument("--size", default="1344x768")
    ap.add_argument("--frames", type=int, default=124)
    ap.add_argument("--full", action="store_true")
    a = ap.parse_args()
    OUT.mkdir(exist_ok=True)
    from shared.api import init
    session = init(console_output=False)
    model = "minimax_h3_fl2va_pruned" if a.full else "minimax_h3_fl2va_pruned_pdd"
    for c in a.concepts:
        tag = f"{c}_s{a.seed}_{a.size}_" + ("full" if a.full else "pdd8")
        s = session.get_default_settings(model)
        s.update({"model_type": model, "prompt": (PROMPTS / f"{c}.txt").read_text(encoding="utf-8"), "image_prompt_type": "", "multi_prompts_gen_type": "FG",
                  "resolution": a.size, "video_length": a.frames, "seed": a.seed, "prompt_enhancer": "", "output_filename": tag})
        if a.full:
            s["num_inference_steps"] = 20
        print(f"=== {tag}", flush=True)
        t0 = time.time()
        r = session.run_task(s)
        kept = []
        for f in (r.generated_files or []):
            if Path(f).suffix.lower() == ".mp4" and Path(f).exists():
                shutil.copyfile(f, OUT / f"{tag}.mp4")
                kept.append(str(OUT / f"{tag}.mp4"))
        rows = json.loads(LOG.read_text(encoding="utf-8")) if LOG.exists() else []
        rows.append(dict(concept=c, engine="wangp", model=model, seed=a.seed, size=a.size, frames=a.frames, seconds=round(time.time() - t0, 1),
                         out=kept, errors=[str(e) for e in (r.errors or [])], at=time.strftime("%Y-%m-%dT%H:%M:%S")))
        LOG.write_text(json.dumps(rows, indent=2), encoding="utf-8")
        print(f"    {time.time() - t0:.0f}s -> {kept} {rows[-1]['errors']}", flush=True)


if __name__ == "__main__":
    main()
