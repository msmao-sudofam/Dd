# Rendering / delivery contract

## Output defaults
- FPS 24. Render total frames `N = round(seconds * fps)`, time domain `t=(f-1)/fps`, frame indices 1..N.
- Default dimensions: 9:16 1080x1920, 16:9 1920x1080, 1:1 1080x1080; accept custom dimensions and 4:5 when requested. Always re-layout per shape.
- Visual safe zones: normally ~7% horizontal margins; keep subtitles away from platform UI in vertical videos (~10-15% bottom, content-dependent). Dynamic font scaling; don't hardcode sizes meant for 1080 into low-resolution canvases.
- Create an output folder in the project workspace; do not overwrite unrelated existing outputs. Save storyboard manifest, source HTML, preview PNGs, final MP4, and render report.

## Deterministic renderer interface
The generated HTML MUST expose:
- `window.ready === true` only after initialization and local assets/fonts are ready
- `window.renderFrame(frameNumber)` accepting integer `1..N` and producing the exact final frame of that number (sync or Promise)
- Every frame should be reconstructable without any previous frame calls. Clear canvas/scene appropriately.
- PRNG seeded by object/frame for particles and jitter; precompute stable layout values. Avoid using `Math.random()` during rendering unless explicitly seeded/stable.

## Bundled helper (installed inside animation-studio/scripts)
Run from the **animation project working directory** (Node 18+, `playwright` and browser installed, `ffmpeg` + `ffprobe` on PATH):

`node /absolute/path/to/animation-studio/scripts/render_video.mjs --html /absolute/path/to/animation.html --seconds 12 --width 1080 --height 1920 --fps 24 --output /absolute/path/to/final.mp4 --preview`

Review preview PNGs in the output folder's `previews/` directory, fix actual visual problems, then run the same command without `--preview` to render the MP4. For supplied audio add `--audio /absolute/path/voice.wav --audio-kind narration`, or `--audio-kind music`. The helper refuses to truncate narration longer than video; fix duration first.

The script uses Playwright's Chromium screenshots and FFmpeg H.264 yuv420p + faststart. It never installs dependencies or calls external APIs automatically. For graphics requiring WebGL, have browser support software WebGL (SwiftShader) or configure a supported GPU browser. If the bundled helper is unsuitable, use an equivalent transparent pipeline while maintaining the frame and verification contract.

## Validations to perform (do not merely assert)
1. Inspect opening, middle, ending, and a shot transition visually. Ensure style signature is immediately recognizable; not palette-only.
2. Confirm each script claim has a corresponding clear beat; no missing scene or mismatched action.
3. Preview for aspect cropping, subject continuity, accidental black/blank frames, excessive overglow, low contrast, unreadable labels/captions, missing font/asset loading, and style drift.
4. If audio exists, check synchronization, speech completeness and appropriate level. If no voiceover was supplied, don't claim real lip or word sync.
5. Use `ffprobe` or equivalent to confirm final video is playable, `codec_name=h264`, correct size, expected FPS and duration, and an audio stream when input required it.
6. Confirm `final.mp4` file exists and is non-empty. Retain render logs and `render_report.json` from the helper.

## Recovery
If a requested tool isn't available, return the exact missing executable/module, what generated artifacts are available, and a reproducible command. Never silently switch to a still image, pretend an MP4 exists, or claim a generated render is validated when only mocked code has run.
