"""
RunPod Serverless worker for the self-hosted "Draft" tier (BUILD_PLAN Phase 5).

Contract with the app (src/lib/providers/self.ts):
  input:  { model, prompt, duration (s), aspect_ratio ("9:16"|"16:9"|"1:1"), image_url?, num_inference_steps? }
  output: { video_url: "data:video/mp4;base64,..." }   (the app copies it into Supabase Storage)

Deploy: build this folder's Dockerfile, push to a registry, create a RunPod Serverless endpoint from it
(L40S / A100, min workers 0, FlashBoot on), then set RUNPOD_API_KEY, RUNPOD_ENDPOINT_ID, SELF_WEBHOOK_SECRET.
"""
import base64
import os
import tempfile

import runpod
import torch
from diffusers import LTXConditionPipeline
from diffusers.utils import export_to_video, load_image

MODEL_ID = os.environ.get("LTX_MODEL_ID", "Lightricks/LTX-Video-0.9.8-13B-distilled")
FPS = 24
SIZES = {"9:16": (512, 896), "16:9": (896, 512), "1:1": (704, 704)}  # multiples of 32

pipe = LTXConditionPipeline.from_pretrained(MODEL_ID, torch_dtype=torch.bfloat16).to("cuda")


def handler(job):
    inp = job["input"]
    prompt = inp["prompt"]
    width, height = SIZES.get(inp.get("aspect_ratio", "9:16"), SIZES["9:16"])
    seconds = int(inp.get("duration", 5))
    num_frames = (seconds * FPS // 8) * 8 + 1  # LTX wants 8k+1 frames
    kwargs = dict(
        prompt=prompt,
        negative_prompt="worst quality, inconsistent motion, blurry, jittery, distorted",
        width=width,
        height=height,
        num_frames=num_frames,
        num_inference_steps=int(inp.get("num_inference_steps", 8)),
        guidance_scale=1.0,
    )
    if inp.get("image_url"):
        from diffusers.pipelines.ltx.pipeline_ltx_condition import LTXVideoCondition

        kwargs["conditions"] = [LTXVideoCondition(image=load_image(inp["image_url"]), frame_index=0)]
    frames = pipe(**kwargs).frames[0]
    with tempfile.NamedTemporaryFile(suffix=".mp4") as f:
        export_to_video(frames, f.name, fps=FPS)
        data = base64.b64encode(open(f.name, "rb").read()).decode()
    return {"video_url": f"data:video/mp4;base64,{data}"}


runpod.serverless.start({"handler": handler})
