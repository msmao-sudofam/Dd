# CGC launch checklist — October 31, 2026

The website and CRM implementation are ready for owner configuration. The generated cinematic video and cloud launch are not complete. Do not treat a passing local test as proof that cloud leads are stored.

## Generated intro

- Creative direction: **The Reflection Run**, with **The Line** as the craft film. Both six-shot boards and twelve shot prompts are in `creative/video-concepts-2026-10-31/VIDEO-STORYBOARDS.md`.
- Install/connect Runway and confirm its workspace allows video generation. Connection verification currently returns an unavailable-tool error; no video generation was submitted or charged through this build.
- Generate individual shots from clean keyframes, inspect geometry and reflections, then edit the approved shots. Preserve the supplied logo; add typography in the edit.
- Deliver a silent 16:9 website loop and a separately framed phone version, with matching posters and descriptive captions. Retain pause/play and reduced-motion behavior. Label generated concepts and keep them separate from CGC project evidence.
- Current intro still uses the supplied CGC footage. Storyboard sheets and generated stills are not completed generated video.

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
