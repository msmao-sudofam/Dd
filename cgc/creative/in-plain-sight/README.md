# In Plain Sight / alternate CGC film concept

Open `CGC-In-Plain-Sight-Concept.html` in a browser. It is the complete offline handoff: embedded room reference, six-panel storyboard, six detailed shot cards, copyable H3/keyframe prompts, production JSON and downloadable Markdown instructions. No network access is needed to view it.

This is a new creative option, not an authorization to replace the active hero or the strict Threshold v4 redo. No video was rendered for this package. Concept images are illustrative and must not be presented as completed CGC work.

## Production direction

Six shots / 16 seconds / 24fps / 384 edited frames. An apparently open meeting area is revealed as a clear-glass room through camera position, visible edges, floor channel, reflections and transparent sightlines. All glass stays installed. The door stays closed and fixed. The qualification shots are P02 and P04. A digital zoom, held still or incorrect camera move fails acceptance.

Read the full brief and shot cards before generation. The package includes H3 prompts for the installed Wan2GP workflow, but runtime and visual performance still need real qualification. Do not claim successful generation from this document alone.

## Source and provenance

Generated on November 1, 2026 using the built-in image generation tool. Exact reference and storyboard prompts are in `IMAGE-PROMPTS.json`. The storyboard was generated with the room reference as its visual input. The PNGs were copied unchanged from:

- Room reference: `C:/Users/Moqui/.codex/generated_images/01a190ad-17bb-7351-9cf3-6aed3b7f0565/exec-40acb2df-c4ee-4207-9d13-1f46b99da258.png`
- Storyboard: `C:/Users/Moqui/.codex/generated_images/01a190ad-17bb-7351-9cf3-6aed3b7f0565/exec-4d13ec3a-88c1-48ca-97c3-a7f4e5710c5a.png`

The company logo is embedded from `cgc/site/assets/logo.svg`. No invented projects, customer names, testimonials, statistics or product performance claims are included.

## Rebuild and verification

From the repository root:

```powershell
python cgc/creative/in-plain-sight/build-handoff.py
node cgc/creative/in-plain-sight/verify.mjs
```

Verification passed at 390px and 1440px: zero horizontal overflow, zero console errors, zero external requests, three loaded embedded images, 18 prompt buttons and zero axe violations. P02 H3 clipboard contents matched the source prompt. Downloaded Markdown and JSON matched the source documents (Markdown line endings normalized). Screenshots were visually reviewed. Evidence is in `verification/`.

This validates the handoff document, not video quality. Video quality gates, frame inspection and motion acceptance remain production work.
