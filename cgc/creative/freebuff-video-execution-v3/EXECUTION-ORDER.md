# CGC — FREEBUFF EXECUTION ORDER
## 0. Execute this task until the hero is installed

Prepared November 1, 2026. This order supersedes every earlier CGC video handoff and overrides any old suggestion to continue website performance audits. The owner explicitly wants actual video generation, visual quality review and installation in the hero.

**Your job is to do the production work with the installed local Wan2GP application. Do not produce another plan and call that done. Do not stop after reading this file, choosing a model, making a storyboard, running calibration or reporting website scores.** Those are intermediate steps. Continue through an accepted, playable hero using newly generated footage.

### What counts as complete

All of these must exist and have been verified:

1. Clean, consistent start images and actual new video shots rendered through Wan2GP. Preserve settings, prompts, model IDs, seeds and output paths. A slideshow, contact sheet, prompt file or re-encode of the existing film does not count as new generation.
2. The generated motion has been visually inspected. Reject deformed frames, floating or duplicated handles, changing window counts, swimming glass, wrong camera movement and inconsistent architecture. Apply the shot's controlled revisions or simpler fallback, then inspect again.
3. A coherent 16-second film assembled from accepted shots, with a dedicated phone composition, clean posters and captions matching what the finished edit shows.
4. The CGC hero references the new versioned files through its actual source generator. The rebuilt site plays that new film; it is not silently using the previous Reflection Run files from cache.
5. Targeted playback verification is complete on desktop and phone: new media URL, successful response, visible motion, pause/play, captions, honest concept disclosure, off-screen/hidden-tab pause and a working reduced-motion poster.
6. A final delivery note lists the new asset paths, selected model, rejected/fallback shots, visual-review evidence, integration changes and remaining genuine blockers. Include a screenshot of the installed hero and a usable local preview URL if supported.

These are internal production gates, not separate user-approval gates. The owner has already asked you to generate and install the film. Do not finish a turn with “ready to generate,” “shall I continue?” or a calibration-only summary when you can continue. If a generation is queued, monitor it to completion; starting a queue is not delivering video.

### Verified local setup — use this installation

GPU checked November 1, 2026: **NVIDIA GeForce RTX 5080, 16,303 MiB VRAM**. Disk presence was verified, but these specific models were not test-rendered by the author of this handoff. Verify runtime compatibility using the installed application's own working presets and exported settings.

Primary Wan2GP application:

```text
C:/pinokio/api/wan.git/app
```

Preferred first candidate — installed preset and both model phases:

```text
finetunes/i2v_2_2_gguf_q4_k_m.json
UI name: Wan2.2 Image2video 14B GGUF Q4_K_M
ckpts/Wan2.2-I2V-A14B-HighNoise-Q4_K_M.gguf
ckpts/Wan2.2-I2V-A14B-LowNoise-Q4_K_M.gguf
```

Both GGUF files are approximately 8.99 GiB each. The two file sizes are not a promise that both phases fit simultaneously in 16GB VRAM. Use the preset's supported offloading/memory behavior, confirm the correct model pair and do not invent guidance/step values.

Installed comparison candidates:

```text
defaults/minimax_h3_fl2va_pruned.json
UI name: MiniMax H3 FL2VA Pruned 20B
ckpts/MiniMax-H3-FL2VA-pruned_rank8_int8_convrot.safetensors

defaults/minimax_h3_ref2va_pruned.json
UI name: MiniMax H3 Ref2VA Pruned 20B
ckpts/MiniMax-H3-Ref2VA-pruned_rank8_int8_convrot.safetensors
```

Each H3 transformer file is approximately 19.61 GiB, so confirm its installed memory/offload profile on the 16GB GPU. Matching H3 heads, video/audio VAEs, encoder and accelerator files were found in the same application. Their presence does not substitute for a successful loading/render test.

For this film, begin with the **Wan 2.2 I2V A14B Q4_K_M** preset. This is the starting recommendation, not a claim that it has already beaten every installed model. **H3 FL2VA** is the comparison candidate for animating the accepted first frames. **H3 Ref2VA** is useful only if a tested reference-conditioned path is needed; do not switch to it just because it sounds more advanced.

There is a second, older installation:

```text
C:/Users/Moqui/talking-head/repos/Wan2GP
```

That installation has Wan 2.1 I2V 480p 14B and talking-head models. Do not mistake it for the Pinokio installation above or conclude that the A14B/H3 models are missing because you searched only this folder.

There is also:

```text
C:/Users/Moqui/ComfyUI/models/diffusion_models/wan2.2_ti2v_5B_fp16.safetensors
```

The previous CGC film was rendered with that 5B checkpoint through **ComfyUI**, according to `cgc/_work/wan_film.py` and the film record. Running that helper again would not demonstrate that you used Wan2GP. The owner requested Wan2GP: use it as the renderer. Do not silently switch applications or declare success based on the old 5B render path.

### First actions — start a real generation

1. Locate the CGC checkout. Known path: `C:/Users/Moqui/Projects/Dd`; public site: `cgc/site`. Read `cgc/STATUS.md`, `cgc/BRIEF.md` and the current `cgc/_work/architectural.py`. Check the working tree and preserve other pending edits.
2. Inspect the existing bad film and its raw source clips if present. Name the actual visible defects. Read the source settings rather than assuming that the file called “final” is good.
3. Open or launch the installed Wan2GP through its existing launcher/environment. Inspect `C:/pinokio/api/wan.git/start.js` if needed to learn the real entrypoint. Reuse its Python environment. Use its existing UI or supported local API/queue; inspect actual installed help/schema before submitting. Do not fabricate endpoints or silently download another application.
4. Extract the embedded entrance reference and board from this HTML. Generate the clean shot keyframes locally using an installed image tool or the receiving environment's available image capability. If good, consistent clean frames already exist, review and reuse them instead of inventing another building.
5. Export a working settings template for the installed A14B preset. Set up one calibration job from section 6, submit it and wait for the actual output. Keep prompts short and shot-specific. Record the precise job/output ID and paths.
6. Inspect the result, make the bounded corrections below, then proceed with the production shots. Do not spend the session writing more plans or investigating site metrics.

Do not change the user's global app settings, upgrade software, install new checkpoints, enter keys, call paid/cloud generators or alter security settings as an unannounced workaround. If an existing runtime cannot start, use the existing launcher/environment and inspect the concrete error before claiming a missing dependency.

### Bounded model choice — pick, then produce

Use the same accepted S02 reflection image and S06 open-doorway image to compare models. Start with A14B. If its native outputs meet the geometry and motion gates, you may proceed immediately rather than benchmarking everything.

If A14B is poor or H3 is already known to run well, make at most two short H3 FL2VA comparison clips using those same two images and movement intents. Use each model's own valid native settings. Compare native output and elapsed time, not compressed delivery files and not just still thumbnails. Different model seeds are not directly comparable; the matched input image and shot intent are the controls.

Choose the model that gives rigid architecture, visible correct motion and a consistent entrance at a workable local runtime. Record a brief reason and move on. Do not conduct an open-ended model study. Do not download LTX/Hunyuan/other weights just to expand the comparison. Do not fall back automatically to the previously rejected 5B production path without explaining the actual reason.

For H3, adapt the shot motion to its installed native prompt format; do not assume the Wan prompt field conventions are identical. Its local FL2VA template includes `integrated_multimodal_description`, `overall_soundscape` and `non_diegetic_music`. Describe one shot, preserve the supplied first frame and keep sound simple; strip audio from the web deliverable. Use local conditioning, not a hosted prompt-enhancement service. Validate its installed template rather than inventing settings.

### Production loop — keep working through it

For S01 through S08:

1. Review the clean start frame against the common entrance. Correct topology before rendering motion.
2. Submit the actual image-to-video job through Wan2GP. Save its exact prompt and exported settings. Wait for completion and verify the output exists and is playable.
3. Watch the shot at normal speed. Inspect the first, quarter, middle, three-quarter and last frames, then scrub the complete retained range for brief failures. Use the available video viewer/browser or extract frames/contact sheets and actually view the images; filenames and metadata are not visual review.
4. Apply the detailed shot's pass/fail rubric. Wrong motion, warped glass or a different building is a rejection even if one frame looks attractive.
5. Try the main prompt and at most two controlled revisions, changing one causal factor per revision. Use the documented simpler fallback where necessary and identify it honestly. A fallback is still a render/edit decision to execute, not permission to stop at a recommendation.
6. Save the accepted result and its clean edit range. Continue to the next shot.

Calibration, model comparison and shot acceptance do not require asking the user to approve every intermediate result. Continue autonomously within the authorized task. If no installed model can produce an acceptable essential shot, report the actual failed jobs and specific limitation; do not declare a bad film complete.

### What visual review must establish

- Macro shots have visible material detail and purposeful camera motion. No free-floating laser, watery pane or generic still zoom masquerading as a truck.
- Framing stays straight and consistent. Handles remain attached. Mullion widths and bay/door counts do not change during a shot.
- The door has a fixed hinge and a small rigid opening arc. If that fails, render the already-open-door camera-only fallback. Do not show a sliding or bending hinged leaf.
- The passage moves through a real clear opening, not through intact glass. The room does not stretch like a tunnel.
- The eight shots belong to the same architectural world. The last exterior is actually blue hour if the edit/captions claim blue hour; otherwise change the shot or describe the accepted result accurately.
- The assembled desktop AND phone film is watched from start to finish, including every cut and the loop join. A single contact sheet is not enough to judge motion quality.

`ffprobe`, frame counts, VMAF, file size and Lighthouse do not prove creative quality. They can support technical checks after a visually accepted film exists. Never use a good compression score as evidence that the original generated motion looks good.

### Install the accepted film — mandatory

The current hero already contains a generated **Reflection Run** film. The user is dissatisfied and wants the new, better-directed result. Do not respond “a generated film already exists” and stop. Do not just recompress, re-caption or re-audit that existing film.

Save the new deliverables under a new versioned folder so the old film remains available for rollback, for example:

```text
cgc/site/assets/film/threshold-v3/desktop.mp4
cgc/site/assets/film/threshold-v3/mobile.mp4
cgc/site/assets/film/threshold-v3/desktop-poster.webp
cgc/site/assets/film/threshold-v3/mobile-poster.webp
cgc/site/assets/film/threshold-v3/captions.vtt
cgc/site/assets/film/threshold-v3/edit.json
```

Generate WebM alternatives if the existing delivery workflow can do so without becoming the new project. Usable MP4 desktop/phone outputs and installation are mandatory; endless codec comparisons are not.

Update `cgc/_work/architectural-hero.html` and `cgc/_work/architectural.js` as needed, then rebuild through `python cgc/_work/architectural.py`. Reference the NEW files. Update the poster to an accepted frame from the new film, the caption track, video description, duration/progress and chapter list to match the new eight-shot edit. Do not retain the old five-shot chapter timing for the new film. Preserve the existing bright design, generated-concept disclosure, controls and real-work gallery.

Test the integrated page, not a standalone video player alone. Confirm `currentSrc` points to the new versioned desktop/phone file, the network response is successful, playback advances and the visible content matches the accepted new film. Verify the poster, captions, pause/resume and reduced-motion behavior. Save proof of the installed hero.

### No website-audit detour

Until the generated film is installed and its playback verified, the following are OUT OF SCOPE:

- Lighthouse runs or repeated website audits.
- Poster-format A/B tests, AVIF/WebP studies and LCP experiments.
- Recompressing the previous film as a substitute for new generation.
- General SEO, CRM, form, layout, gallery, font or legal-page work.
- Fixing unrelated development-server analytics 404s or deployment configuration.
- A new storyboard/handoff rewrite in place of operating the renderer.

After installation, perform only the targeted smoke checks needed for the changed hero: desktop/phone source and crop, playback, pause, captions, disclosure, reduced-motion/static fallback and no introduced page errors. Fix a real blocker to viewing the new hero. Do not turn those checks into another multi-hour website optimization task. A broader audit can be requested separately after the video task is delivered.

### Delivery and genuine blockers

Your final message must say which model actually rendered the new film, where the accepted shots/master/web assets are, what failed or used a fallback, which generator files changed, how the integrated hero was visually verified and where to open it locally. Do not claim deployment if you only ran a local preview. Do not push or promote production.

Stop early only for a concrete blocking condition that prevents authorized progress: unavailable renderer access, a reproducible runtime/dependency failure, insufficient hardware after supported adjustments, or lack of any way to visually inspect the outputs. Report the exact attempted command/job, relevant error, completed files and the one action needed to unblock. “Audits passed,” “prompts ready,” “queue submitted” and “model comparison complete” are not completion or blockers.

**Finish line: a newly generated, visually reviewed film playing in the CGC hero.**

## Production detail follows

The remaining manual supplies the original art direction and exact eight shot cards. Section 0 controls scope, application choice, checkpoints and the definition of done. Where older wording suggests returning intermediate reports or general website audits, follow section 0 instead and continue the production task.
