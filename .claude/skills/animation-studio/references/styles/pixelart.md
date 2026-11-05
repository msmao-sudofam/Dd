# Pixel Art — reusable art direction

Pixel Art, crisp low-resolution 16-bit-inspired sprite animation.

## Signature and non-negotiables
- Objects are *constructed from integer-aligned pixels*, not ordinary vector art with a pixel filter. Work on a small logical raster canvas and scale with **nearest neighbor, no smoothing**. Choose an integer pixel scale (e.g. 6x for 1080-wide work); calculate the low-res canvas based on aspect.
- Each recognizable character, vehicle, building, interface, or prop has an intentional silhouette, an outline 1 logical pixel thick where useful, and 3–5 shade bands. Palettes are cohesive and limited, but **pick colors from the story** rather than forcing every piece to the source PDF's purple sunset.
- Dither band transitions with stable ordered patterns; snap small particles, dust and highlights to integer pixels. Pixel motions can update in steps (such as on twos) while output remains 24 fps.
## Adapt visuals to any script
- Explain abstract topics with sprite objects, maps, game-world metaphors or HUDs only when relevant. For tutorials or product stories, build recognizable pixel mock-ups of the *specific* app/subject, not interchangeable characters.
- For people, use meaningful clothing, pose, silhouette, facial pixels and props so identities persist. For real-world places, design their distinct layout as crisp tiles/parallax planes.
- Use layered environments and parallax when depth helps; indoors, white backgrounds, laboratories, classrooms, space, nighttime etc are all valid.
## Motion language
- Pixel-native stepped movement, squash/stretch in whole pixels, directional dust or impact sparks; held poses are acceptable when dialogue requires them. Use quick camera changes only for narrative emphasis.
## Captions, if enabled
- Blocky pixel font rendered at an actually readable logical resolution; 2–6 words per phrase and contrasting shadow/outline. No half-pixel antialiasing. Key words may use a contrasting palette color.
## Failure checks
- No blurry resampling, subpixel drift, smooth-gradient gradients, generic arcade HUD on unrelated themes, or characters that become unrecognizable because silhouettes are too small.

## Procedural implementation notes (starting points, not hardcoded scene content)
- Start with low-res Canvas 2D at exactly 1/6 of 1080p output when possible: 9:16 `180x320`, 1:1 `180x180`, 16:9 `320x180`. Upscale x6 with `imageSmoothingEnabled=false`, `image-rendering:pixelated`. For custom sizes choose a fitting integer scale; never stretch the wrong ratio.
- Draw separate sprite layers with integer coordinates, threshold sprite alpha for hard pixels, add 1-logical-pixel edge outlines and 3-5 material tones. A stable 4x4 Bayer matrix provides the controlled color dither; don't repeatedly randomize pixel edges.
- Pixel bloom/shakes: use grid-aligned 1-2 pixel sparkles, stepped squash/stretch, 1-2 logical pixel directional camera jitter; avoid smooth interpolated movement at sprite edges.


## Universal constraint
Follow the actual supplied narration, script or storyboard and adapt the subject matter to it. This document describes **how to render whatever the user supplies**, not a fixed story, fixed environment or mandatory camera position. Shared intake, frame rendering and QA are in the sibling `animation-studio` skill.
