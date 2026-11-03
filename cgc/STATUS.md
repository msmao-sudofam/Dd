# CGC status — November 2, 2026 (evening)

**Hero film now: H3 concept A, "The Lift"** (`site/assets/film/lift-a/`): an 8-step MiniMax H3 draft at native
1344x768, 5 s, three cuts (crane lift, glaziers guide the unit, sealed facade). Generated concept, labeled as such.
Concepts and workflow: `creative/hero-concepts-h3/CONCEPTS.md`. Threshold v4 kept in `site/assets/film/threshold-v4/` for rollback.

Preview: **https://cgc-glazing-3phjcr1cz-sdvsfbs.vercel.app/** (project `cgc-glazing`, target `preview`, Ready). In an
authenticated Chrome session `lift-a/desktop.mp4` (1344x768, 5.17 s) played and advanced 1.5 s in 1.5 s, chapter and
timer followed the clip, no v4 references remain. Not promoted; DNS and Deployment Protection untouched; not pushed.
Open item: local H3 output needs a MiniMax commercial license (sold via Comfy) before it goes live.

# CGC status — November 2, 2026

**Hero film: THE THRESHOLD v4 is installed locally** (`site/assets/film/threshold-v4/`), replacing the rejected v3.
All eight shots were regenerated with MiniMax H3 and individually checked against the strict v4 shot cards; S05 starts
with the door closed (owner-approved). Details, deviations and evidence: `creative/threshold-v4/DELIVERY.md` and
`_work/threshold-v4/REVIEW-LOG.md`. Not pushed or promoted; DNS and Deployment Protection untouched.

v4 preview: **https://cgc-glazing-4fkj76htc-sdvsfbs.vercel.app/** (project `cgc-glazing`, target `preview`, Ready,
deployed with `--project cgc-glazing --target preview`). In an authenticated Chrome session `threshold-v4/desktop.mp4`
(2,950,946 bytes) returned 200, autoplayed on load and advanced 3.0 s in 3 s; captions file has 8 cues; no v3 references
remain in the page. Unauthenticated requests still get a 302 to Vercel SSO. The older preview URLs below serve older films.

# CGC status — October 31, 2026

Current generated-film preview: **https://cgc-glazing-wtwmodxmt-sdvsfbs.vercel.app/** (target `preview`, Ready). The compressed film autoplays, captions and the concept label were verified live in an authenticated browser session. Deployment Protection remains enabled, so unauthenticated visitors still receive a 302 to Vercel SSO. The earlier previews **https://cgc-glazing-omyr91l7e-sdvsfbs.vercel.app/** and **https://cgc-glazing-bcvesobuw-sdvsfbs.vercel.app/** predate the compressed film.

Vercel project `cgc-glazing`, scope `sdvsfbs`, authenticated CLI account `moquinmoreno-1021`. This is a preview; no client domain/DNS or production promotion is included. Deployment Protection remains enabled. The read-only project environment listing found no configured environment variables.

## Current site

The user's selected white, graphite and steel-blue palette supersedes the original dark/amber interface. The current architectural revision uses bold Archivo display type, a white masthead, a high-quality generated entrance concept, a 60px header, dark ruled scope rows, an asymmetric real-project gallery and a direct bid form. No shadows, rounded cards, 3D scene or scroll trap.

The hero now autoplays a muted **generated concept film** on load, visibly labeled **Concept film / generated visualization** with a second disclosure line; pause/play and CC remain available. The current film is **The Threshold** (8 × 2 s, 1600×900 desktop / 720×1280 phone, 2.9 MB / 1.5 MB) served from `site/assets/film/threshold-v3/`, and the video paints the same poster as the hero picture before its first frame, so the poster remains the LCP candidate. It is not presented as actual CGC footage or as a completed CGC project. The earlier supplied-footage montage is no longer the hero intro; real photographs and five field clips remain in the separate Work gallery and expandable field-clip section. Three before/after concepts share keyboard-operated tabs; original jobsite comparisons remain available separately. All 76 retained real photographs are present in static HTML, with six initially displayed and Show more. The CRM, exact consent copy, unchecked SMS checkbox, facts, calculator, SEO and legal pages remain intact.

Rebuild current public design: `python cgc/_work/architectural.py`. For manifest injection only: `python cgc/site/_build.py`. Earlier generators remain as dependencies and historical versions; do not run `redesign.py` alone to rebuild the current visual design.

## Generated intro film

**The Threshold (v3)** is now the installed hero film: eight 2-second shots, 16.000 s, silent, 1600×900 at 24 fps, generated locally with **WanGP** using the **Wan2.2 Image2video 14B GGUF Q4_K_M** preset (1280×720, 49 frames, uniPC, 20 steps), from clean keyframes made with Qwen-Image-Edit-2511 against the supplied entrance reference. Files are `site/assets/film/threshold-v3/` (desktop/mobile MP4 + WebM, AVIF/WebP posters, eight-cue captions, `edit.json`); the previous film remains in `site/assets/film/` for rollback. S03 uses the card's rightward-truck alternate; **S05 and S08 are documented held plates**, because the model would not keep the door leaves still. Delivery note, review log and verification: `creative/threshold-v3/`. This build is local only — nothing was deployed, pushed or promoted.

**The Reflection Run** was the previous 16.04-second five-shot film: five shots from the Film B storyboard in `creative/video-concepts-2026-10-31/VIDEO-STORYBOARDS.md`, rendered locally with Wan 2.2 TI2V 5B at 1280×704 and edited to 1600×900 and 720×1100. Files are `site/assets/film/wide.mp4`, `portrait.mp4`, matching posters and captions plus `edit.json`. The delivered MP4s are a CRF 28 web re-encode of the CRF 24 edit masters (3.02 MB desktop / 1.47 MB phone, H.264 High, no audio, unchanged dimensions, duration and cuts); VMAF against the previous masters was 91.8 and 92.3. Provenance, exact prompts, seeds, crop rectangles and limitations are in `creative/reflection-run-film-2026-10-31/FILM.md` and `film.json`.

The hero autoplays the muted film on load, with the poster retained until playback is ready and as the fallback. The video poster mirrors the visible picture, so the poster rather than the delayed first frame is the LCP image. Play/pause, CC, progress and five chapter labels remain available; reduced motion and JavaScript-off keep the poster and never load the film. The generated film is kept separate from the real project gallery.

**The Threshold** remains an alternative eight-shot, two-second-per-shot direction. Its handoff file `creative/the-threshold/CGC-The-Threshold-Handoff.html` embeds the board, reference, logo and prompts. It is a production plan, not generated video, and is not the film implemented here.

## Current verification

- API suite: **31/31 passed** after fixing malformed JSON request bodies and UTF-8 byte limits. API code is unchanged in this visual revision.
- Functional browser scenarios: **10/10 passed**, including local form submission and populated email fallback, labeled errors, calculator, slider keys, lightbox, legal pages and CRM SAMPLE editing.
- 360 / 390 / 430 / 1440: **0px overflow, 0 console errors, 0 automated WCAG A/AA violations, 0 measured controls under 44px, 0 inputs under 16px**.
- Concept tab arrow/Home/End keys, muted autoplay, compressed responsive 1600×900 / 720×1100 sources (3.02 MB / 1.47 MB), play/pause, CC, chapters, deferred field clips and pause behavior passed. The fifth caption cue and chapter `05 / Reveal the building` were reached by seek; the concept label and disclosure are present. Reduced motion retains the poster without loading the film. JavaScript-off at 390px keeps the poster visible with video opacity 0; no film source is requested.
- Generated film: 16.04s, silent, 24fps, 1600×900 desktop / 720×1100 phone. Wide 3.02MB; portrait 1.47MB after the CRF 28 web encode. Local Wan test renders were reviewed for stable framing before the edit; compressed key frames were inspected at 1:1.
- Latest Lighthouse mobile (Lighthouse 13.6.0, three runs each, local lab): **88–90 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; FCP 1.35s, LCP 3.68–3.83s, TBT 0ms, CLS 0. The click-to-play baseline under the same current environment also scores **88–90** with LCP 3.83–3.90s, so no stable score gap remains; the earlier 90-vs-88 result was environment variance. Compression plus the poster-first change reduces page transfer from 3,258 KiB to 2,190 KiB versus the uncompressed autoplay build.
- Hero poster is now AVIF-first with a WebP fallback: desktop `entrance-light.avif` (1600×900, 112.6 KB, was 182.6 KB) and `entrance-light.webp` (151.3 KB); phone `entrance-light-sm.avif` 34.5 KB / `.webp` 43.4 KB. Rebuilt by `python cgc/_work/posters.py`. The film no longer mirrors a second poster copy; the video is revealed on its first decoded frame, so the poster `<img>` remains the only poster request and the LCP candidate. Matched slow-4G desktop A/B (Lighthouse 13.6.0, three passes each, desktop 1350×940): **73 → 74 Performance**, LCP **4,802 → 4,353 ms** (−449 ms), poster transfer 155,113 → 115,486 bytes. Accessibility 100, SEO 100 in both; Best Practices 96 in both because the local server 404s the deployment-only `/_vercel/insights/script.js`.
- The generated-film preview above is Ready with target `preview`. In an authenticated browser session the compressed desktop film autoplayed (3,017,582-byte `wide.mp4`), the CC control showed all five cues and the generated-concept label/disclosure were present. Deployment Protection still redirects unauthenticated visitors to SSO. No DNS change, Deployment Protection change or production promotion of `cgc-glazing` was performed.
- Incident: a first deploy attempt from `cgc/site` without an explicit project flag created a separate Vercel project named `site` and auto-promoted its deployment to production (`https://site-gao33kud9-sdvsfbs.vercel.app`). It is not `cgc-glazing` and should not be used as the CGC preview. Removing that project or deployment requires owner approval; it was not deleted here.
- Deploy from `cgc/site` with `--project cgc-glazing`; without that flag the CLI can create a new project instead of reusing the linked one.
- Static injection idempotent; IDs unique. Desktop and phone hero/concept/scope/gallery/form views visually inspected.
- Single-file storyboard tested offline at 390 and 1440: 8 shots, 3 embedded images loaded, JSON download passed, 0 external requests, 0 script errors, 0 overflow.

## Owner launch steps

1. Connect a **Private Vercel Blob store** to Preview and Production and configure `CRM_KEY` (strong, at least 12 characters). No credentials/store were created or entered by this build.
2. Optional notifications: configure `RESEND_API_KEY`, `LEAD_NOTIFY_TO`, `REPORT_FROM` with an owner-verified sender. No automatic SMS sender is included.
3. Redeploy after environment changes. Submit a clearly marked cloud test lead, verify persistence in authenticated CRM, edit its stage/note, archive it and check optional email. Local tests and SAMPLE mode do not verify cloud storage.
4. Complete `site/LEGAL-NOTES.md` owner checklist, media/address review and documented data-retention procedures.
5. Owner changes Deployment Protection for public access, reviews the preview, then promotes the intended deployment to production.
6. Owner follows `DNS-PLAN.md`, preserving all existing email MX/TXT and mail-related records. Primary: cgcontractorsinc.com; alternates commercialglazingcontractorsinc.com and cgclimited.com redirect 308, including www variants. Verify paths/queries, HTTPS and inbound/outbound email.

See `LAUNCH-CHECKLIST.md` and `site/CRM-SETUP.md`. Next: Spanish version, Google Business Profile and a review QR using the owner's real review destination.

## Prior CLI incidents

During the earlier build, `vercel curl` unexpectedly generated a protection-bypass token; the owner should review/revoke it. A later project-link command unexpectedly downloaded a local OIDC credential; that local file was deleted without opening or using its contents. Both incidents were disclosed. No additional bypass/link commands or credentials were used in this revision. DNS, Deployment Protection and production promotion remain unchanged.

Changes are committed in small steps on the existing branch. Nothing was pushed.

## Detailed local-video handoff v2

The user reported poor first video results and identified Wan2GP plus other local models. The new standalone file is `creative/the-threshold-v2/CGC-Threshold-v2-Complete-Handoff.html`. It supersedes the earlier short motion directions with 9,410 words, eight detailed shot cards, three calibration tests, clean-keyframe/main/short/timeline prompts, fixed/moving element definitions, source timing, pass/fail criteria, fallbacks and finishing instructions. All reference media are embedded. Exact installed model/settings and the failed files were not supplied; the receiving operator is instructed to inspect them, not infer a diagnosis.

The offline file passed 390/1440 layout, script, accessibility, reference loading, download and text-extraction checks. No website code, hosting, DNS, credentials or Deployment Protection changed in this handoff task.
