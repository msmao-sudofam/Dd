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
    "S05": ("The same photograph from the same eye-level camera position. The right-hand door leaf is nearly "
            "closed, open only about fifteen degrees toward the camera. It is hinged on its RIGHT edge at the jamb, "
            "where the hinges are visible; its long vertical stainless pull is mounted near its LEFT free edge, "
            "beside the closed left leaf. One pull per leaf. Same columns, frames, glass, lobby and terrazzo. "
            "No people."),
    "S05END": ("The same photograph with the same camera position, lens and framing. Only the right-hand door "
               "leaf has moved: it has swung open toward the camera to about forty degrees, rotating on its hinges "
               "at the right jamb, so its free edge with the pull now stands clearly forward of the facade and the "
               "gap beside the left leaf is much wider. The leaf is rigid and keeps its single pull. The left leaf, "
               "frames, columns, floor, sunlight, lobby and sky are unchanged."),
    "S05CLOSED": ("The same photograph, identical camera position, lens, framing and light. Only the right-hand door "
                  "leaf has moved: it is now fully closed, flush in the same plane as the left leaf and the frame, "
                  "with its long vertical stainless pull still near its left free edge beside the left leaf and its "
                  "hinges at the right jamb. Everything else is unchanged."),
    "S08": ("The same photograph from the same camera position and framing, rephotographed at blue hour about "
            "twenty minutes after sunset. The sun is gone: no sunlight, no sun flare, no shadows from the sun. The "
            "sky is an even deep steel blue; trees and columns outside are dim and cool blue. The lobby ceiling "
            "lights are on and glow warm amber through the glass, casting warm reflections on the terrazzo. "
            "Keep every door, pull, column and frame exactly where it is. No people."),
}


def render(shot, seed, steps=28, w=1536, h=864, src=None):
    name = f"cgc-threshold-v4-src-{shot}.png" if src else "cgc-threshold-ref.png"
    shutil.copyfile(src or k3.REF, k3.COMFY / "input" / name)
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
        reference=str(src or k3.REF), seconds=round(time.time() - t0, 1)), indent=2), encoding="utf-8")
    print(f"{dst.name} {time.time()-t0:.0f}s", flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--shot", required=True, choices=sorted(PROMPTS))
    ap.add_argument("--seeds", type=int, nargs="+", required=True)
    ap.add_argument("--src", type=Path, help="edit this image instead of the entrance reference (S05END)")
    a = ap.parse_args()
    OUT.mkdir(exist_ok=True)
    for s in a.seeds:
        render(a.shot, s, src=a.src)
