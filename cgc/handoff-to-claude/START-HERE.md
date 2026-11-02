# CGC transfer to Claude / November 2, 2026

This is a snapshot of the local project, including uncommitted and untracked CGC work. It is not a claim that the site or video production is fully finished. The archive includes Freebuff-attributed outputs already present locally; any separate Freebuff chat, machine, or working directory must be exported by Freebuff using FREEBUFF-EXPORT-PROMPT.md.

## How to receive it

Extract CGC-Claude-Project.zip into an empty working folder. Extract CGC-Claude-Source-Media.zip into the SAME folder to add raw photographs/video, render intermediates, candidate clips and visual evidence. Both archives preserve the cgc/ tree. Read this file and CURRENT-STATE.md before modifying anything. The source-media archive is important for diagnosing rejected films; the main archive alone is sufficient to inspect the website source and creative directions but not all render attempts.

Do not extract over a newer working copy. Compare and reconcile instead. These are ordinary file snapshots without Git internals, local dependencies, model weights or credentials. transfer-manifest.json lists included file hashes; transfer-exclusions.json records excluded paths. Git state and text patches are included as evidence; the files in the snapshot already contain those changes. Do not apply the patches again over the snapshot.

## Read order

1. cgc/BRIEF.md for verified company facts. Its original dark visual tokens are historical: the user selected white, graphite and steel blue later.
2. cgc/CODEX-HANDOFF.md for the original scope. Its original 3D hero is superseded: the user wants generated cinematic video.
3. cgc/handoff-to-claude/CURRENT-STATE.md for unresolved work and conflicting status reports.
4. cgc/STATUS.md, LAUNCH-CHECKLIST.md, DNS-PLAN.md, MOBILE-AUDIT-2026-11-01.md. Treat their tests and deployment claims as dated evidence, not live verification.
5. cgc/creative/threshold-v3/DELIVERY.md and AB-MODEL-TEST.md, followed by the strict v4 redo package.
6. The three alternate creative concepts listed in CURRENT-STATE.md.

## Preserve these requirements

Use only verified company facts. Never invent reviews, awards, years, job counts, customer approvals or performance claims. Generated concepts must be clearly separated from actual CGC project photographs and footage.

The user disliked the existing site and rejected the generated film because it did not follow the script. A zoomed still, held plate, wrong camera direction or different physical action is not an acceptable substitute. Document failures honestly. Do not choose a new concept or silently install it merely because its plan exists.

Do not edit DNS, create or enter keys/tokens, change Vercel Deployment Protection, promote production or push Git without fresh applicable authorization. Preserve primary-domain email MX/TXT records. Owner launch tasks remain: Private Blob store, CRM_KEY, optional notification variables, cloud persistence verification, legal/media review, public-access decision and DNS cutover. Do not print existing credentials.

## Local source and commands

Source repository: C:/Users/Moqui/Projects/Dd

Branch at snapshot: claude/install-claude-code-cli-Px3YJ. Last completed creative commit: 6c25075. Other agents have uncommitted website/film changes; the snapshot includes them. Inspect git-state.txt for capture-time state. Keep the current branch if continuing locally and commit narrowly. Do not discard existing edits.

Current site generator: python cgc/_work/architectural.py. It depends on older generators and assets in _work; do not run redesign.py alone and assume it reproduces the current design. Keep generated index.html aligned with source templates. Gallery-only injection: python cgc/site/_build.py.

API checks: cd cgc/site; npm i; npm test. The prior result was 31 passing tests, not a fresh result from this transfer. api/_lib/schema.js is authoritative for lead fields and pipeline stages. npm run dev:crm starts the local in-memory development server. Re-run relevant checks after changes. No cloud persistence is proven by local tests.

## First response expected from Claude

Confirm which files and Freebuff export were received. Reconcile the current state without rebuilding finished sections unnecessarily. Identify the active film assignment, the latest actual render results and any missing files. Distinguish completed work, rejected work and plans. Then continue the user's selected work with exact motion/action acceptance; avoid replacing production with more website audits or another handoff.

No local model video was rendered as part of making this transfer. The complete chat transcript and other agents' private conversations are not included; this packet contains project files and a written continuity summary.
