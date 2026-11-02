"""Render one CGC concept-film shot with local Wan 2.2 5B (ComfyUI API).

These are generated concept visuals, not footage of completed CGC work.
Usage: python wan_film.py <shot> [--seed N]
"""
import argparse, json, shutil, subprocess, sys, time, urllib.parse, urllib.request
from pathlib import Path

COMFY = Path("C:/Users/Moqui/ComfyUI")
ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "_work/film-src"
OUT = ROOT / "_work/film-raw"
NEG = ("Low contrast. Blurry, soft focus, distorted architecture, warped mullions, "
       "melting glass, floating panes, duplicated doors, changing bay spacing, "
       "text, letters, signage, logo, watermark, people, faces, extra hardware, "
       "camera shake, sudden cut, oversaturated colors, CGI look.")

SHOTS = {
    "b01": dict(
        image="b01-crop.png",
        prompt=("Extreme macro along a polished clear-glass door edge in morning sunlight. "
                "A small reflected blue sky and white building sit naturally in the glass thickness. "
                "The camera moves slowly lengthwise; a thin highlight travels over the edge as the angle changes. "
                "Shallow depth of field, fine material detail, rigid real glass, physically smooth move. "
                "Photorealistic live-action architectural cinema, steel-blue glass, graphite aluminum, "
                "correct verticals, restrained film grain, no people."),
    ),
    "b02": dict(
        image="b02-crop.png",
        prompt=("Oblique grazing view along a white commercial office facade with complete steel-blue curtain-wall glazing. "
                "Track slowly left to right close to the glass while real clouds and the white architecture move in convincing "
                "reflection parallax. Mullions stay rigid and evenly spaced; the entrance stays in the same position. "
                "Camera movement is physically smooth, one controlled move. Photorealistic live-action architectural cinema, "
                "graphite aluminum, morning sun, restrained grain, no people, no text."),
    ),
    "b03": dict(
        image="b03-crop.png",
        prompt=("Slow forward glide toward and through an open graphite-framed glass entrance door of a bright white commercial lobby. "
                "Reflections of trees and sky on the left glass panes shift naturally with parallax; the real interior terrazzo floor "
                "and sun patch stay consistent. The camera passes through the existing opening without crossing glass or changing the architecture. "
                "Physically smooth camera, photorealistic live-action architectural cinema, steel-blue glass, no people, no text."),
    ),
    "b05": dict(
        image="b05-crop.png",
        prompt=("Rise and arc slowly around a frameless glass conference-room corner in a bright white office interior. "
                "Layers of reflected sky resolve into clear transparency as the angle changes. Keep one light-oak table and dark chairs "
                "behind the glass, glass edges sharp and physically fixed, ceiling lights and carpet stable. "
                "One controlled camera move, photorealistic live-action architectural cinema, no people, no text."),
    ),
    "b06": dict(
        image="b06-crop.png",
        prompt=("Exterior architectural pullback of the same white commercial office building at blue hour, complete steel-blue curtain-wall "
                "glazing and quiet clean sidewalk. Camera pulls back slowly and rises only slightly; warm restrained interior lights glow. "
                "Preserve facade bay counts and entrance position. Photorealistic live-action architectural cinema, physically smooth move, "
                "no drone swoop, no people, no text."),
    ),
}


def post(path, payload):
    req = urllib.request.Request(
        "http://127.0.0.1:8188" + path,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def get(path):
    with urllib.request.urlopen("http://127.0.0.1:8188" + path, timeout=60) as r:
        return json.load(r)


def graph(image_name, prompt, prefix, seed):
    return {
        "37": {"class_type": "UNETLoader", "inputs": {"unet_name": "wan2.2_ti2v_5B_fp16.safetensors", "weight_dtype": "default"}},
        "38": {"class_type": "CLIPLoader", "inputs": {"clip_name": "umt5-xxl-encoder-fp8-e4m3fn-scaled.safetensors", "type": "wan", "device": "default"}},
        "39": {"class_type": "VAELoader", "inputs": {"vae_name": "wan2.2_vae.safetensors"}},
        "48": {"class_type": "ModelSamplingSD3", "inputs": {"model": ["37", 0], "shift": 8}},
        "6": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["38", 0]}},
        "7": {"class_type": "CLIPTextEncode", "inputs": {"text": NEG, "clip": ["38", 0]}},
        "56": {"class_type": "LoadImage", "inputs": {"image": image_name}},
        "55": {"class_type": "Wan22ImageToVideoLatent", "inputs": {"vae": ["39", 0], "width": 1280, "height": 704, "length": 121, "batch_size": 1, "start_image": ["56", 0]}},
        "3": {"class_type": "KSampler", "inputs": {"model": ["48", 0], "seed": seed, "steps": 20, "cfg": 5, "sampler_name": "uni_pc", "scheduler": "simple", "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["55", 0], "denoise": 1}},
        "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["39", 0]}},
        "9": {"class_type": "SaveImage", "inputs": {"images": ["8", 0], "filename_prefix": prefix}},
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("shot", choices=sorted(SHOTS))
    ap.add_argument("--seed", type=int, default=1109661)
    a = ap.parse_args()
    spec = SHOTS[a.shot]
    src = SRC / spec["image"]
    assert src.exists(), src
    name = f"cgc_{a.shot}_{src.suffix.lstrip('.')}"
    shutil.copyfile(src, COMFY / "input" / name)
    prefix = f"cgc-film/{a.shot}_{a.seed}"
    OUT.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    r = post("/prompt", {"prompt": graph(name, spec["prompt"], prefix, a.seed), "client_id": "cgc-film"})
    pid = r["prompt_id"]
    print("queued", pid, flush=True)
    while True:
        time.sleep(5)
        h = get(f"/history/{pid}")
        if pid in h:
            entry = h[pid]
            status = entry.get("status", {})
            if status.get("completed") or status.get("status_str") == "success":
                break
            if status.get("status_str") == "error":
                print(json.dumps(status, indent=1))
                sys.exit(1)
        s = get("/queue")
        running = any(x[1] == pid for x in s.get("queue_running", []))
        print(f"  {int(time.time()-t0)}s running={running}", flush=True)
    files = []
    for node in h[pid]["outputs"].values():
        files += node.get("images", [])
    files.sort(key=lambda x: x["filename"])
    dst = OUT / a.shot
    if dst.exists():
        shutil.rmtree(dst)
    dst.mkdir()
    for i, f in enumerate(files):
        with urllib.request.urlopen(f"http://127.0.0.1:8188/view?filename={urllib.parse.quote(f['filename'])}&subfolder={urllib.parse.quote(f['subfolder'])}&type=output", timeout=120) as resp:
            (dst / f"frame_{i:04d}.png").write_bytes(resp.read())
    mp4 = OUT / f"{a.shot}.mp4"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "24", "-i", str(dst / "frame_%04d.png"),
                    "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", str(mp4)], check=True)
    print("wrote", mp4, len(files), "frames", f"{time.time()-t0:.0f}s", flush=True)


if __name__ == "__main__":
    main()
