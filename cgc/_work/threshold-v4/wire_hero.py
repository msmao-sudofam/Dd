"""Point the hero at threshold-v4 and rebuild. Run only after assemble.py --install succeeded.

Edits the generator sources (architectural-hero.html, architectural.js), then runs architectural.py.
"""
import subprocess
import sys
from pathlib import Path

WORK = Path(__file__).resolve().parents[1]
DEST = WORK.parent / "site/assets/film/threshold-v4"
need = ["desktop.mp4", "mobile.mp4", "captions.vtt", "desktop-poster.webp", "desktop-poster.avif",
        "desktop-poster-sm.webp", "desktop-poster-sm.avif"]
if missing := [n for n in need if not (DEST / n).exists()]:
    sys.exit(f"install the film first, missing: {missing}")
for name in ("architectural-hero.html", "architectural.js"):
    p = WORK / name
    t = p.read_text(encoding="utf-8")
    t = t.replace("assets/film/threshold-v3/", "assets/film/threshold-v4/")
    # v4 S05 shows a door opening, not doors already standing open.
    t = t.replace("'The doors stand open'", "'A door opens'").replace("the open doors,", "a door opening,")
    p.write_text(t, encoding="utf-8")
subprocess.run([sys.executable, str(WORK / "architectural.py")], check=True)
print("hero now points at threshold-v4")
