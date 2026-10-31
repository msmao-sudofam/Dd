# CGC status — October 31, 2026

Current preview: **https://cgc-glazing-bcvesobuw-sdvsfbs.vercel.app/**

Vercel project `cgc-glazing`, scope `sdvsfbs`, authenticated CLI account `moquinmoreno-1021`. This is a preview; no client domain/DNS or production promotion is included. Deployment Protection remains enabled. The read-only project environment listing found no configured environment variables.

## Current site

The user's selected white, graphite and steel-blue palette supersedes the original dark/amber interface. The current architectural revision uses bold Archivo display type, a white masthead, a high-quality generated entrance concept, a 60px header, dark ruled scope rows, an asymmetric real-project gallery and a direct bid form. No shadows, rounded cards, 3D scene or scroll trap.

The hero image is visibly labeled **Architectural concept / generated visualization**. The old 16-second montage of actual CGC footage now plays only on request; its label switches to actual field footage when loaded. It is not presented as the requested generated intro. Three before/after concepts share keyboard-operated tabs; original jobsite comparisons remain available separately. All 76 retained real photographs are present in static HTML, with six initially displayed and Show more. Five field clips are in an expandable section and defer loading until visible. The CRM, exact consent copy, unchecked SMS checkbox, facts, calculator, SEO and legal pages remain intact.

Rebuild current public design: `python cgc/_work/architectural.py`. For manifest injection only: `python cgc/site/_build.py`. Earlier generators remain as dependencies and historical versions; do not run `redesign.py` alone to rebuild the current visual design.

## Intro handoff for local models

**The Threshold**: eight shots, two seconds each, 16 seconds / 384 frames at 24fps. A luminous glass edge leads through reflections, framing detail and the threshold into the lobby, ending at the blue-hour entrance.

Send the one file `creative/the-threshold/CGC-The-Threshold-Handoff.html` to Rebuff. It embeds the generated eight-frame storyboard, entrance reference, supplied logo, eight clean-keyframe prompts, eight motion prompts, timing, camera moves, edit/loop guidance, caption draft, export contract and Rebuff instructions. It works offline and offers image/JSON downloads. Sources, provenance and builder are in the same directory. It is a production plan, **not completed generated video** or an executable local-model workflow. The user's local models will generate the footage.

## Current verification

- API suite: **31/31 passed** after fixing malformed JSON request bodies and UTF-8 byte limits. API code is unchanged in this visual revision.
- Functional browser scenarios: **10/10 passed**, including local form submission and populated email fallback, labeled errors, calculator, slider keys, lightbox, legal pages and CRM SAMPLE editing.
- 360 / 390 / 430 / 1440: **0px overflow, 0 console errors, 0 automated WCAG A/AA violations, 0 measured controls under 44px, 0 inputs under 16px**.
- Concept tab arrow/Home/End keys, manual hero playback, responsive film source, CC, deferred field clips and pause behavior passed. Reduced motion retains the poster without loading the hero film. JavaScript-off and 320px reflow passed.
- Latest Lighthouse mobile: **89 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**. FCP 1.2s, LCP 3.8s, TBT 0ms, CLS 0. Local lab measurements, not field data.
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
