#!/bin/bash
# SessionStart hook: install the video-use skill (https://github.com/browser-use/video-use)
# so it is available in every Claude Code on the web session for this repo.
#
# Idempotent and non-interactive. Web-only: does nothing on a local machine, where
# you should install video-use yourself once (it persists locally).
set -euo pipefail

# Only run in the ephemeral remote (web) environment. Locally, exit quietly.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

REPO_DIR="$HOME/Developer/video-use"
SKILLS_DIR="$HOME/.claude/skills"

log() { echo "[video-use-setup] $*"; }

# Use sudo only when not already root.
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

# 1. Clone (or update) the repo at a stable path.
if [ -d "$REPO_DIR/.git" ]; then
  log "updating existing clone at $REPO_DIR"
  git -C "$REPO_DIR" pull --ff-only --quiet || log "pull skipped (offline or diverged)"
else
  log "cloning video-use into $REPO_DIR"
  mkdir -p "$(dirname "$REPO_DIR")"
  git clone --quiet --depth 1 https://github.com/browser-use/video-use "$REPO_DIR"
fi

# 2. Install ffmpeg (+ optional yt-dlp) if missing. Hard requirement.
if ! command -v ffmpeg >/dev/null 2>&1; then
  log "installing ffmpeg via apt"
  $SUDO apt-get update -qq || true
  $SUDO DEBIAN_FRONTEND=noninteractive apt-get install -y ffmpeg >/dev/null
else
  log "ffmpeg already present"
fi

# 3. Install Python deps into the SYSTEM python so the helpers work from any
#    directory (the skill invokes `python helpers/<name>.py` from the user's
#    footage folder, not from this repo's venv).
if command -v uv >/dev/null 2>&1; then
  log "installing python deps with uv (system)"
  uv pip install --system -e "$REPO_DIR" >/dev/null
else
  log "installing python deps with pip"
  python3 -m pip install -e "$REPO_DIR" >/dev/null
fi

# yt-dlp is optional (URL sources). Best-effort, never block on it.
if ! command -v yt-dlp >/dev/null 2>&1; then
  if command -v uv >/dev/null 2>&1; then
    uv pip install --system yt-dlp >/dev/null 2>&1 || log "yt-dlp install skipped"
  else
    python3 -m pip install yt-dlp >/dev/null 2>&1 || log "yt-dlp install skipped"
  fi
fi

# 4. Register the skill: symlink the WHOLE repo dir (helpers/ must sit next to SKILL.md).
mkdir -p "$SKILLS_DIR"
ln -sfn "$REPO_DIR" "$SKILLS_DIR/video-use"
log "skill symlinked at $SKILLS_DIR/video-use"

# 5. ElevenLabs API key. Never store the secret in the repo — source it from the
#    ELEVENLABS_API_KEY environment variable (set it as a secret in your web
#    environment settings). If unset, leave an empty .env so nothing breaks.
if [ ! -f "$REPO_DIR/.env" ]; then
  cp "$REPO_DIR/.env.example" "$REPO_DIR/.env"
fi
if [ -n "${ELEVENLABS_API_KEY:-}" ]; then
  printf 'ELEVENLABS_API_KEY=%s\n' "$ELEVENLABS_API_KEY" > "$REPO_DIR/.env"
  chmod 600 "$REPO_DIR/.env"
  log "wrote ELEVENLABS_API_KEY to .env from environment"
else
  log "ELEVENLABS_API_KEY not set — transcription disabled until you add it (env secret)"
fi

log "video-use ready. Drop footage in a folder and say: 'edit these into a launch video'"
