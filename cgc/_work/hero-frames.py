"""Scroll-film frames, sharper: ESRGAN x2 (local ComfyUI) on each source frame, then
desktop d###.webp (1920x1080) and phone p###.webp (720x1280 portrait crop).

  python hero-frames.py build  -> site/assets/film/build/   (S1 build render, 81 frames)
  python hero-frames.py reel   -> site/assets/film/reelscroll/ (concept reel, 131 frames)
"""
import io, json, subprocess, sys, time, uuid
from pathlib import Path
import requests
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
COMFY = 'http://127.0.0.1:8188'
JOBS = {  # source, output folder, every nth frame, frame count, phone crop centre (0..1 of width)
    'build': (ROOT / '_work/hero-h3/renders/S1_scroll_the_build_s101_1344x768_full.mp4', 'build', 3, 81, .42),
    'reel': (ROOT / 'site/assets/film/reel/desktop.mp4', 'reelscroll', 5, 131, .5),
}


def upscale(img):
    name = f'hf_{uuid.uuid4().hex[:8]}.png'
    buf = io.BytesIO(); img.save(buf, 'PNG')
    requests.post(f'{COMFY}/upload/image', files={'image': (name, buf.getvalue())}, data={'overwrite': 'true'}).raise_for_status()
    g = {'1': {'class_type': 'LoadImage', 'inputs': {'image': name}},
         '2': {'class_type': 'UpscaleModelLoader', 'inputs': {'model_name': 'RealESRGAN_x2plus.pth'}},
         '3': {'class_type': 'ImageUpscaleWithModel', 'inputs': {'upscale_model': ['2', 0], 'image': ['1', 0]}},
         '4': {'class_type': 'SaveImage', 'inputs': {'images': ['3', 0], 'filename_prefix': 'hf'}}}
    pid = requests.post(f'{COMFY}/prompt', json={'prompt': g, 'front': True}).json()['prompt_id']
    while True:
        h = requests.get(f'{COMFY}/history/{pid}').json()
        if pid in h:
            if h[pid]['status'].get('status_str') == 'error':
                raise RuntimeError(json.dumps(h[pid]['status'])[:400])
            o = h[pid]['outputs']['4']['images'][0]
            r = requests.get(f'{COMFY}/view', params={'filename': o['filename'], 'subfolder': o['subfolder'], 'type': o['type']})
            return Image.open(io.BytesIO(r.content)).convert('RGB')
        time.sleep(.3)


def main(job):
    src, folder, step, count, cx = JOBS[job]
    out = ROOT / 'site/assets/film' / folder
    out.mkdir(parents=True, exist_ok=True)
    w, h = 1344, 768
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(src), '-vf', f'select=not(mod(n\\,{step})),scale={w}:{h}',
                          '-fps_mode', 'passthrough', '-frames:v', str(count), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    n = len(raw) // (w * h * 3)
    assert n == count, f'expected {count} frames, got {n}'
    for i in range(n):
        if (out / f'p{i + 1:03d}.webp').exists() and (out / f'd{i + 1:03d}.webp').exists():
            continue  # resume
        big = upscale(Image.frombytes('RGB', (w, h), raw[i * w * h * 3:(i + 1) * w * h * 3]))
        big.resize((1920, 1080), Image.LANCZOS).save(out / f'd{i + 1:03d}.webp', quality=80, method=6)
        H = big.height; W = round(H * 9 / 16); x = min(max(0, round(big.width * cx - W / 2)), big.width - W)
        big.crop((x, 0, x + W, H)).resize((720, 1280), Image.LANCZOS).save(out / f'p{i + 1:03d}.webp', quality=74, method=6)
        print(f'{job} {i + 1}/{n}', flush=True)


if __name__ == '__main__':
    main(sys.argv[1])
