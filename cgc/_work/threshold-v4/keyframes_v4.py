"""Clean v4 start frames for shots whose v3 keyframe broke its card
(S01 handle close-up, S03 floor-level door corner, S08 tight crop).

Reuses the v3 Qwen-Image-Edit-2511 ComfyUI graph and the same entrance reference.
Generated concept stills, not CGC project photography.

  python keyframes_v4.py --shot S01 --seeds 9101 9102 9103
"""
import argparse, json, shutil, sys, time, urllib.parse, urllib.request
from pathlib import Path

V3 = Path(__file__).resolve().parents[1] / "threshold-v3"
sys.path.insert(0, str(V3))
import keyframes as k3  # graph(), post(), get(), REF, COMFY, HOST

OUT = Path(__file__).resolve().parent / "keyframes"

PROMPTS = {
    "S01": ("Extreme macro photograph of the polished vertical edge of one thick clear architectural "
            "glass pane. The glass edge is a straight, almost vertical line placed at about 58 percent of "
            "the image width, running from about 15 percent to 88 percent of the image height. A narrow "
            "cool-white highlight runs along the real edge; the slight green tint of the glass thickness is "
            "visible. A dark graphite aluminum mullion and soft dark background fill the rest of the frame. "
            "Shallow depth of field, fine real texture. No door handle, no pull, no hardware, no lobby view, "
            "no neon line."),
    "S03": ("Close photograph of one graphite aluminum storefront framing joint at chest height, away from any "
            "door. A slim vertical mullion stands at about 55 percent of the image width and meets a horizontal "
            "transom of the same width crossing at about 60 percent of the image height, square and flush. Black "
            "gaskets are seated against clear glass panes in all four quadrants; soft sky and the bright lobby "
            "are visible through the glass. Brushed metal, straight rigid members, natural daylight. No floor, "
            "no door, no handle, no hinge."),
    "S08": ("The same photograph from the same camera position with the same framing, lens and composition. "
            "Change only the time of day to blue hour: a deep, even steel-blue evening sky, cooler exterior "
            "light, warm interior ceiling lights glowing through the glass and reflecting softly on the "
            "terrazzo. Keep both door leaves exactly where they are, the same stainless pulls, white columns, "
            "graphite frames, trees and floor. No sun, no sunbeams, no people, no new objects."),
}


def render(shot, seed, steps=28, w=1536, h=864):
    name = "cgc-threshold-ref.png"
    shutil.copyfile(k3.REF, k3.COMFY / "input" / name)
    prefix = f"cgc-threshold-v4/{shot}_seed{seed}"
    t0 = time.time()
    pid = k3.post("/prompt", {"prompt": k3.graph(name, PROMPTS[shot], prefix, seed, w, h, steps),
                              "client_id": "cgc-threshold-v4"})["prompt_id"]
    while True:
        time.sleep(5)
        hist = k3.get(f"/history/{pid}")
        st = hist.get(pid, {}).get("status", {})
        if st.get("status_str") == "error":
            raise SystemExit(json.dumps(st)[:2000])
        if pid in hist and (st.get("completed") or st.get("status_str") == "success"):
            break
    f = next(i for n in hist[pid]["outputs"].values() for i in n.get("images", []))
    dst = OUT / f"{shot}_v4_s{seed}.png"
    with urllib.request.urlopen(f"{k3.HOST}/view?filename={urllib.parse.quote(f['filename'])}"
                                f"&subfolder={urllib.parse.quote(f['subfolder'])}&type=output", timeout=180) as r:
        dst.write_bytes(r.read())
    dst.with_suffix(".json").write_text(json.dumps(dict(shot=shot, seed=seed, steps=steps, size=[w, h],
        model="qwen_image_edit_2511_fp8mixed", prompt=PROMPTS[shot], negative=k3.NEG,
        reference=str(k3.REF), seconds=round(time.time() - t0, 1)), indent=2), encoding="utf-8")
    print(f"{dst.name} {time.time()-t0:.0f}s", flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--shot", required=True, choices=sorted(PROMPTS))
    ap.add_argument("--seeds", type=int, nargs="+", required=True)
    a = ap.parse_args()
    OUT.mkdir(exist_ok=True)
    for s in a.seeds:
        render(a.shot, s)
