"""Render H3 hero concepts through ComfyUI's native MiniMax H3 nodes (the official
video_minimax_h3_i2v template graph, sent as an API prompt to 127.0.0.1:8188).

Official settings: fl2va pruned int8, res_multistep + simple, 20 steps, 1344x768 (H3's native 768p canvas).
--turbo swaps in the lightx2v 8-step LoRA for drafts.

  python render_comfy.py A_the_lift --seed 101 --turbo
  python render_comfy.py B_storefront_before_after --first first.png --last last.png
"""
import argparse, json, shutil, time, urllib.parse, urllib.request
from pathlib import Path

HOST = "http://127.0.0.1:8188"
COMFY = Path("C:/Users/Moqui/ComfyUI")
HERE = Path(__file__).resolve().parent
PROMPTS = HERE.parents[1] / "creative/hero-concepts-h3/prompts"
OUT = HERE / "renders"


def call(path, body=None):
    req = urllib.request.Request(HOST + path, data=json.dumps(body).encode() if body else None,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def graph(prompt, seed, w, h, length, turbo, first=None, last=None):
    g = {
        "unet": {"class_type": "UNETLoader", "inputs": {"unet_name": "minimax_h3_fl2va_pruned_int8_convrot.safetensors", "weight_dtype": "default"}},
        "clip": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors", "type": "minimax", "device": "default"}},
        "vae": {"class_type": "VAELoader", "inputs": {"vae_name": "minimax_h3_video_vae_int8_convrot.safetensors"}},
        "avae": {"class_type": "VAELoader", "inputs": {"vae_name": "minimax_h3_audio_vae_fp32.safetensors"}},
        "cond": {"class_type": "MiniMaxH3ImageToVideo", "inputs": {"clip": ["clip", 0], "vae": ["vae", 0], "prompt": prompt,
                                                                   "width": w, "height": h, "length": length}},
        "noise": {"class_type": "RandomNoise", "inputs": {"noise_seed": seed}},
        "sampler": {"class_type": "KSamplerSelect", "inputs": {"sampler_name": "res_multistep"}},
        "sched": {"class_type": "BasicScheduler", "inputs": {"model": ["model", 0], "scheduler": "simple", "steps": 8 if turbo else 20, "denoise": 1}},
        "guider": {"class_type": "BasicGuider", "inputs": {"model": ["model", 0], "conditioning": ["cond", 0]}},
        "sample": {"class_type": "SamplerCustomAdvanced", "inputs": {"noise": ["noise", 0], "guider": ["guider", 0], "sampler": ["sampler", 0],
                                                                     "sigmas": ["sched", 0], "latent_image": ["cond", 1]}},
        "dec": {"class_type": "VAEDecode", "inputs": {"samples": ["sample", 0], "vae": ["vae", 0]}},
        "adec": {"class_type": "VAEDecodeAudio", "inputs": {"samples": ["sample", 0], "vae": ["avae", 0]}},
        "video": {"class_type": "CreateVideo", "inputs": {"images": ["dec", 0], "audio": ["adec", 0], "fps": 24}},
        "save": {"class_type": "SaveVideo", "inputs": {"video": ["video", 0], "filename_prefix": "cgc-hero-h3/out", "format": "auto", "format.codec": "auto"}},
    }
    if turbo:
        g["model"] = {"class_type": "LoraLoaderModelOnly", "inputs": {"model": ["unet", 0], "strength_model": 1,
                                                                     "lora_name": "minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors"}}
    else:
        g["model"] = g.pop("unet")
    for key, img in (("first_frame", first), ("last_frame", last)):
        if img:
            name = f"cgc-hero-h3-{key}-{Path(img).name}"
            shutil.copyfile(img, COMFY / "input" / name)
            g[key] = {"class_type": "LoadImage", "inputs": {"image": name}}
            g["cond"]["inputs"][key] = [key, 0]
    return g


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("concept")
    ap.add_argument("--seed", type=int, default=101)
    ap.add_argument("--turbo", action="store_true")
    ap.add_argument("--size", default="1344x768")
    ap.add_argument("--length", type=int, default=124, help="frames, 17k+5 (124 = 5 s, 243 = 10 s)")
    ap.add_argument("--first")
    ap.add_argument("--last")
    a = ap.parse_args()
    w, h = map(int, a.size.split("x"))
    prompt = (PROMPTS / f"{a.concept}.txt").read_text(encoding="utf-8")
    t0 = time.time()
    pid = call("/prompt", {"prompt": graph(prompt, a.seed, w, h, a.length, a.turbo, a.first, a.last),
                           "client_id": "cgc-hero-h3"})["prompt_id"]
    while True:
        time.sleep(10)
        hist = call(f"/history/{pid}").get(pid)
        if not hist:
            continue
        st = hist.get("status", {})
        if st.get("status_str") == "error":
            raise SystemExit(json.dumps(st)[:3000])
        if st.get("completed"):
            break
    f = next(v for n in hist["outputs"].values() for k in ("images", "videos", "gifs") for v in n.get(k, []))
    OUT.mkdir(exist_ok=True)
    tag = f"{a.concept}_s{a.seed}_{w}x{h}" + ("_turbo" if a.turbo else "")
    dst = OUT / f"{tag}.mp4"
    q = urllib.parse.urlencode({"filename": f["filename"], "subfolder": f.get("subfolder", ""), "type": "output"})
    with urllib.request.urlopen(f"{HOST}/view?{q}", timeout=300) as r:
        dst.write_bytes(r.read())
    log = HERE / "render-log.json"
    rows = json.loads(log.read_text(encoding="utf-8")) if log.exists() else []
    rows.append(dict(concept=a.concept, seed=a.seed, size=a.size, length=a.length, turbo=a.turbo, first=a.first, last=a.last,
                     seconds=round(time.time() - t0, 1), out=str(dst), at=time.strftime("%Y-%m-%dT%H:%M:%S")))
    log.write_text(json.dumps(rows, indent=2), encoding="utf-8")
    print(f"{dst.name} {time.time() - t0:.0f}s", flush=True)


if __name__ == "__main__":
    main()
