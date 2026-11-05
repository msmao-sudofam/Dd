# Universal input contract — frictionless and script-first

## Intake priority
1. Read the invocation arguments, attached files, current turn, and established information from previous turns. Identify: script/voiceover, subject, story objective, style, output shape, desired length, assets, on-screen text requirement, audio.
2. If a script exists, treat its **words, sequence, names, key facts, and promised payoff as locked**. Do not automatically rewrite narration for drama, delete beats, replace it with generic metaphors, or change any factual claim. An editorial edit is permitted only when requested; otherwise plan visuals around it.
3. Infer defaults rather than interrupt: shape 9:16 at 1080x1920 for a short vertical video; 24 fps; captions OFF unless explicitly requested or the script explicitly contains required in-scene text; audio from supplied assets only; tone from script; original subjects from script; background/context from content, not a generic sunset/city.
4. Distinguish *captions/subtitles* from *essential on-screen content*: "no captions" removes subtitles, not labels on charts, locations, speech bubbles that are essential to a comic story, signage, or script-specified text. Clarify only if actual conflict.
5. Voiceover comes first for duration. Use `ffprobe` or equivalent for its actual length, then time visuals to supplied audio. Never shorten or speed up delivered speech silently. A script without voiceover: estimate at ~130-160 spoken words/min plus pauses, then refine timing by story cadence. Short visual-only concepts: derive duration from beats and user goal. Respect explicit duration when feasible; if script would be cut, extend or create logically labeled parts rather than silently discarding words.
6. Text timing: timecode lines when supplied; otherwise align sentence or clause boundaries, natural emphasis and pauses. If audio's spoken timing cannot be automatically extracted, do not promise word-accurate sync; use scene-level estimates and disclose it.
7. User images/logos: use their actual content where feasible, honor identity and visual relationships. Stylize elements to the selected art direction rather than pasted-in mismatched photographs unless user insists. Never invent logos, voice files, or unavailable media. Treat reference images as style guidance unless the user asks to use them as footage.
8. If a script calls for named characters or brands, preserve distinct features while avoiding unauthorized replication of exact logos/minifigure designs when unneeded. If exact recognition requires an asset the user has not supplied, approximate transparently, or ask once if essential.

## Extremely short first question when needed
"Paste your script (or tell me the idea). Optional: attach a voiceover or images, and specify format, length, and captions. I'll use 9:16, inferred timing, and no subtitles if you don't specify."

Never ask all five original questions reflexively. If a script and requirements are already present, **start production immediately**.

## Flexible user input examples
- `/pixelart` then paste 6 lines of narration: begin without further questions.
- `/comicart A superhero loses their coffee, 8 sec, square, no subtitles`: infer an original plot, build it.
- `/flatvector 16:9, use my uploaded 22-second voiceover, show labels only`: honor voiceover and labels; no subtitle overlays.
- `/ps2` followed by shot list with timecodes: map every shot; don't invent an alternate story.
- `/zackdfilms change shot 3's camera and keep everything else`: edit shot 3 only; keep original project assets.

## Decision policy
Ask ONE direct question only when required, such as: no idea/script; ambiguous mutually exclusive directions; identity-critical reference missing; user prohibits extending a script longer than requested. Otherwise choose and record a sensible default in `project.json`.
