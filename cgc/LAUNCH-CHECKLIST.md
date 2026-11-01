# CGC launch checklist — October 31, 2026

The website and CRM implementation are ready for owner configuration. A generated concept film is integrated and deployed only to a protected preview; it is not owner-approved and is not a substitute for real project evidence. Cloud launch is not complete. Do not treat a passing local test as proof that cloud leads are stored.

## Generated intro

- Implemented: **The Reflection Run**, five shots / 16.04 seconds, silent. Local Wan 2.2 TI2V 5B from the Film B storyboard in `creative/video-concepts-2026-10-31/VIDEO-STORYBOARDS.md`; edit provenance in `creative/reflection-run-film-2026-10-31/`.
- Site files: `site/assets/film/wide.mp4` (1600×900), `portrait.mp4` (720×1100), posters, five-cue captions and `edit.json`. The CRF 28 web encode is 3.02MB desktop / 1.47MB phone, H.264, 24fps, no audio; dimensions and cuts are unchanged.
- The hero autoplays the film muted on load, visibly labeled **Concept film / generated visualization**, with a separate disclosure line and first-caption disclosure. The video poster mirrors the hero picture so the poster remains the LCP candidate; pause/play, CC, chapters and the reduced-motion poster fallback are retained. JavaScript-off keeps the poster instead of an empty video. It is kept separate from the actual project gallery.
- The film is a generated visualization, **not a completed CGC project** and not evidence of installed work. It is deployed only to a protected preview (`https://cgc-glazing-wtwmodxmt-sdvsfbs.vercel.app/`, target `preview`). Live autoplay of the compressed 3,017,582-byte desktop film, CC (five cues) and the concept label/disclosure were verified in an authenticated browser session; unauthenticated visitors still redirect to Vercel SSO. Owner review is still required before production consideration.
- A separate Vercel project named `site` was created accidentally by the first deploy attempt and auto-promoted to production. It is not the CGC project; review/removal needs owner approval.
- **The Threshold** remains an alternative eight-shot direction and handoff (`creative/the-threshold/CGC-The-Threshold-Handoff.html`); it is a production plan, not generated video.
- The earlier supplied CGC footage is no longer the hero intro; real photos and field clips remain in the Work gallery.
- Not produced: WebM alternates and a 9:16 native/independently generated phone edit. The portrait film is a reframed crop. The website uses a single MP4 source, which Safari plays; the film was not owner-approved and no social sound mix exists.

## Owner account configuration

1. Review the earlier unintended Vercel protection-bypass token and revoke it in the account. A later project-link command downloaded a local OIDC credential unexpectedly; that local file was deleted without reading or using it. Deployment Protection was not changed.
2. Connect a **Private** Blob store to the existing `cgc-glazing` project in Preview and Production. See `site/CRM-SETUP.md`.
3. Owner creates `CRM_KEY` (at least 12 characters) in Vercel, keeps it out of chat/source, and redeploys. No key was created or entered by this build.
4. Optionally configure all three email variables listed in `site/CRM-SETUP.md`, with a verified sender. If email is omitted, check the CRM daily. There is no automatic SMS sender.
5. Submit a marked test request on the cloud preview. Confirm it survives a reload in authenticated CRM, edit its stage and note, then archive it. Check optional email receipt. Test the mailto failure path separately. SAMPLE mode does not verify cloud persistence.
6. Complete `site/LEGAL-NOTES.md` owner review, including public address, media permissions and retention procedures.
7. Owner changes Deployment Protection for public access, then reviews the complete preview before production promotion.
8. Owner promotes production and follows `DNS-PLAN.md`. Preserve all existing email MX/TXT and mail-related records. Verify HTTPS and 308 redirects for the primary/www and both alternate/www domains, including path and query preservation. Test incoming and outgoing email.

## After launch

- Spanish version: translate the approved public copy and consent wording, then review with a fluent speaker before publishing.
- Google Business Profile: owner verifies business access and public address/service-area settings.
- Review QR: use the owner's real review link after verification. No placeholder review destination or fabricated reviews.

Code changes remain on the current branch; nothing was pushed. The owner-account steps above remain pending under the original instructions prohibiting DNS changes, keys/tokens and Deployment Protection changes.
