# CGC launch checklist — October 31, 2026

The website and CRM implementation are ready for owner configuration. The generated cinematic video and cloud launch are not complete. Do not treat a passing local test as proof that cloud leads are stored.

## Generated intro

- Current production direction: **The Threshold**, eight shots / 16 seconds. Send `creative/the-threshold/CGC-The-Threshold-Handoff.html` alone to Rebuff. It embeds the board, entrance reference, logo, prompts, edit instructions and export contract.
- The user will use local models. Follow installed model capabilities; this pack does not assume a particular model or executable ComfyUI graph. Generate clean stills, then individual video shots, inspect geometry/reflections and assemble the edit.
- Deliver silent desktop/portrait MP4 + WebM, posters, descriptive captions and an edit provenance manifest. Preserve pause/play, reduced-motion fallback and clear generated-concept disclosure.
- Current hero is a labeled generated entrance still. The old supplied-footage montage is available only on request. Neither the storyboard nor the still is completed generated video.
- Earlier alternative boards remain in `creative/video-concepts-2026-10-31/` for reference.

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
