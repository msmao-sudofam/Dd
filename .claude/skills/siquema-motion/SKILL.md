---
name: siquema-motion
description: SÍ QUEMA's motion taste and QA gate for any video, reel, ad, or animation made for the brand (Sí Quema, SIQUEMA, siquemasupplements). Load it BEFORE planning edits or overlays, and run its gate BEFORE showing any render. Holds the slop ban list, the swap table, the move registry (keep/evolve/watch/retire), the claims and sources rules for a supplement brand, and the feedback log. Use together with video-use, Higgsfield, Kling, or hand-built ffmpeg/PIL/HTML animations.
---

# SÍ QUEMA Motion

This skill sits in front of whatever makes the video (video-use, Higgsfield, Kling,
hand-written overlays). It has two jobs: say what good looks like for SÍ QUEMA, and
say no to everything that looks like AI slop or a supplement scam. The engine makes
the video. This skill decides whether it ships.

## The files and when to read them

| File | What it holds | Read when |
|---|---|---|
| `brand/brand.md` | Who SÍ QUEMA is, products, voice, assets rules | Every job, first |
| `brand/store.json` | Live catalog: titles, prices, descriptions, photo paths (from `scripts/fetch_store.py`) | Any product shot or price. If it's missing or more than 30 days old, re-run the fetch. |
| `principles.md` | The 6 rules everything comes back to | Every job |
| `slop.md` | Ban list + swap table ("instead of X, do Y") | Planning any motion |
| `compliance.md` | What a supplement video can and can't say | Any on-screen text, VO, or caption |
| `sources.json` | Every number/claim allowed on screen, with its source | Any number or claim |
| `moves.json` | ~30 named moves with status: new / current / watch / retired | Picking moves |
| `references/` | Reels M Mo likes, broken down into rules | Picking a style |
| `feedback.md` | Every note M Mo gave, and the rule learned from it | Every job, before planning |

## Workflow

1. **Load.** Read `brand/brand.md`, `principles.md`, `feedback.md`, `slop.md`.
   If on-screen text or VO is involved, read `compliance.md` and `sources.json`.
2. **Plan with named moves.** Pick moves from `moves.json` by id. Only `current`
   and `new` moves by default. A `watch` move needs a reason in the plan. `retired`
   moves never get used. If the plan needs a move that isn't in the registry,
   add it as `new` with `why` and `next` (`python3 scripts/moves.py add ...`).
3. **Confirm.** Present the plan in plain English: the hook, the moves by name, every
   on-screen claim and number with its source id. Wait for a yes (same rule as video-use).
4. **Build** with the engine of choice. Product visuals come ONLY from M Mo's
   real photos/footage in `brand/assets/` or the project folder. Never generate,
   redraw, or describe the packaging or label.
5. **Gate.** Run the gate on everything that will ship:
   ```bash
   python3 .claude/skills/siquema-motion/scripts/gate.py \
     --video <edit>/final.mp4 \
     --code <edit>/animations \
     --text <edit>/master.srt <copy.md> \
     --out <edit>/verify
   ```
   - It scans the code for slop patterns, scans every text for banned claims,
     checks every number against `sources.json`, checks the FDA disclaimer, checks
     flashing (more than 3 flashes per second fails), and writes a contact sheet.
   - Then **the godfather** reviews the frames. That's a separate reviewer whose
     only job is saying no. Spawn it with the Agent tool, without your build context,
     so it can't go easy on its own work. Give it: the contact sheet paths,
     `gate_report.md`, `slop.md`, `principles.md`, `compliance.md`, `sources.json`.
     Tell it: "You are the godfather of graphics. Every graphic must point to
     something real (the label, the product, the person, the room). Fail anything
     on the ban list, any unsourced number, any AI-looking product or person, any
     stutter. Return PASS or FAIL with a reason for each frame you object to."
     Paste its verdict into the report under "Visual check". Code passing is not
     enough. The frames have to pass the godfather.
   - FAIL → fix and re-run. Never show M Mo a render that hasn't passed.
     WARN → fix it, or write one line on why it stays.
6. **Present** the render with the gate summary line (`MOTION GATE: PASS …`).
7. **Learn.** Every note M Mo gives goes into `feedback.md` as
   *note → what it learned*, the same turn. If the note is about a move, update
   the move in `moves.json` too. If it bans something, add it to `slop.md` and,
   when it can be detected in code, to the patterns in `scripts/gate.py`.
8. **Log usage.** `python3 scripts/moves.py use <id> [<id> ...]` for each move that shipped.

## Transcription

Transcription goes through the **ElevenLabs connector**, no API key needed (video-use's
own Scribe path wants `ELEVENLABS_API_KEY`; skip it). It costs roughly 6 credits
per second of audio (~15¢ for 75 s), so transcribe each source once and cache it.
1. `ffmpeg -i <video> -vn -ac 1 -b:a 96k <edit>/audio/<name>.mp3`
2. `creative_create_flow` → `creative_create_asset_upload` (exact byte size, `audio/mpeg`)
   → `curl -X PUT -H "Content-Type: audio/mpeg" --data-binary @<mp3> "<upload_url>"`
   → `creative_finalize_asset_upload` with the flow_id
3. `creative_transcribe_audio` (model `eleven_scribe_v1`, connect_from = that node), then poll
   `creative_get_flow_run_status`. Never call transcribe twice for the same file; each call is charged.
4. Save the `words` array (word-level start/end) to `<edit>/transcripts/<name>.json`.
   That's the same shape video-use expects, so cuts and captions work from it.

## Move lifecycle

Every move has a shelf life. Run `python3 scripts/moves.py review` every ~10 videos
or when M Mo asks. It suggests Keep / Evolve / Watch / Retire from usage and age.
Claude flags. M Mo makes the call. Apply with
`python3 scripts/moves.py set <id> <status> --note "<why>"`.

## Hard rules

1. No weight-loss or fat-loss claims, in English or Spanish, in text, VO, or captions. See `compliance.md`.
2. No number on screen without a `sources.json` entry.
3. Any benefit claim → the FDA disclaimer appears on screen in the same video.
4. Real product only. No AI packaging, no AI "customers", no AI before/after.
5. Nothing reaches M Mo until the gate passes AND you've checked the frames.
6. Bilingual by design, not by translation: Spanish lines are written for Spanish speakers, not run through a translator.
