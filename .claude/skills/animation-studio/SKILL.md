---
name: animation-studio
description: Animate scripts and ideas as videos in 10 styles: Pixel Art, Chalkboard, Glow Sketch, PS2, Comic Art, Flat Vector, Dan Koe, CGI Motion, Lego, and ZackD Films.
---
# Animation Studio — one Claude web skill with 10 style modules

## Activation / routing
This is one skill. Its ten style modules are NOT separate slash commands. Users can simply write **"Pixel Art: [script]"**, **"Use Lego Style for this script"**, or a similar natural-language request. Treat a leading `/pixelart`, `/chalkboard`, `/glowsketch`, `/ps2`, `/comicart`, `/flatvector`, `/dankoe`, `/cgimotion`, `/legostyle`, or `/zackdfilms` as a style selector **if the chat accepts that literal text**; do not promise web slash-command registration.

Match styles case-insensitively: Pixel Art→pixelart; Chalkboard/ChalkBoard→chalkboard; Glow Sketch→glowsketch; PS2/retro console→ps2; Comic Art→comicart; Flat Vector→flatvector; Dan Koe/minimal constellation→dankoe; CGI Motion→cgimotion; Lego/brick-built→legostyle; ZackD Films/clay 3D→zackdfilms.

Treat `Use Animation Studio /pixelart` (and the nine corresponding style selectors) as an explicit request to activate this skill and that style. The slash token is a text selector inside the message, not a registered Claude web command. If someone provides the style selector without a script or idea, ask only: "What script or idea should I animate?" If they have already included the script or idea, begin without more intake questions.

If the user provides content without a style, ask just **"Which style: Pixel Art, Chalkboard, Glow Sketch, PS2, Comic Art, Flat Vector, Dan Koe, CGI Motion, Lego Style, or ZackD Films?"**. If there's a relevant previously chosen style, reuse it instead of asking.

## Required files
1. Read `references/INPUT_CONTRACT.md` and `references/PRODUCTION_WORKFLOW.md`.
2. Read exactly the chosen `references/styles/<style>.md` file and implement its defining aesthetic for *all* subjects and environments, not just recoloring existing artwork.
3. Before rendering, read `references/RENDERING_AND_QA.md` and `references/QUALITY_RUBRIC.md`.

## Behavior
- Paste-script-first: derive subject, location, visual action and story beats from the script; preserve user's words unless asked to rewrite. Do not force a five-question intake. When only an idea is provided, write a concise working script and storyboard appropriate to it.
- Ask only a truly blocking question. Otherwise assume sensible defaults: vertical 9:16 for short-form, 24fps, duration based on script/narration (not an arbitrary 3–60s cap), no subtitles unless requested. Explain defaults only when relevant.
- Keep every beat connected to the script. Maintain characters, materials, props, staging, visual motif and geography from frame to frame. Create strong readable action and avoid repetitive shots.
- Treat provided assets as source of truth. Use the exact supplied voiceover if possible, preserving pacing and completeness; never invent timing claims. Distinguish subtitles from diagram labels and in-world signs.
- Work toward an actual playable MP4, plus reproducible editable source, storyboard and preview frames, if available runtime supports generating them. The included `scripts/render_video.mjs` is an OPTIONAL local Chromium+FFmpeg helper, not guaranteed to work on Claude.ai web. Never attempt unauthorized package installation or imply web has unrestricted system dependencies.
- **Claude.ai web runtime adaptation:** first inspect available execution/file tools. If browser, Node, Chromium, or FFmpeg are unavailable, do not claim MP4 export; provide the best available storyboard, HTML/SVG source or render-ready package, explain exact limitation in one sentence, and if appropriate provide directions for rendering in a supported environment. Never present a static image as verified animated MP4.
- Test preview frames at beginning, major transitions and ending; verify readability, cropping and style consistency. Verify file existence, metadata, duration and audio before claiming MP4 success.
- For edits, maintain established settings and change only what's requested.

## Response format
Minimal: show deliverable links when generated and verified, with at most a few lines describing missing requirements or blockers. Avoid boilerplate and do not ask whether to save the skill (already installed).
