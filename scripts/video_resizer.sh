#!/usr/bin/env bash
#
# video_resizer.sh — shrink/convert videos with ffmpeg without obvious quality loss.
# Companion to image_resizer.sh.
#
# Usage:
#   ./scripts/video_resizer.sh                      # scan default dirs for videos
#   ./scripts/video_resizer.sh file1.mp4 dir/clip.mov ...   # only the files you list
#
# Tunables (env vars):
#   MAXW=1280     # cap width in px (height auto, keeps aspect, never upscales)
#   CRF=24        # quality: lower = better/bigger (18 visually lossless, 23-26 web-friendly)
#   PRESET=slow   # x264 speed/efficiency tradeoff (slower = smaller files)
#   AUDIO=128k    # audio bitrate; set AUDIO=none to strip audio
#   WEBM=0        # set WEBM=1 to also emit a .webm (VP9) sibling for modern browsers
#   GIF2MP4=1     # convert .gif -> .mp4 (massive savings); original .gif is kept
#
# Notes:
#   - Re-encodes to H.264 + AAC in an MP4 with +faststart (web streaming friendly).
#   - Each result is only kept if it is actually smaller than the source.
#   - macOS `stat -f%z` is used for byte sizes (matches image_resizer.sh).

set -uo pipefail

MAXW="${MAXW:-1280}"
CRF="${CRF:-24}"
PRESET="${PRESET:-slow}"
AUDIO="${AUDIO:-128k}"
WEBM="${WEBM:-0}"
GIF2MP4="${GIF2MP4:-1}"

# Default scan locations (edit to match your project layout).
SCAN_DIRS=("public/assets" "public/images" "public/assets/graphics")

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install it first (e.g. brew install ffmpeg)." >&2
  exit 1
fi

filesize() { stat -f%z "$1" 2>/dev/null || echo 0; }

audio_args() {
  if [ "$AUDIO" = "none" ]; then
    echo "-an"
  else
    echo "-c:a aac -b:a $AUDIO"
  fi
}

# scale='min(MAXW,iw)':-2  -> cap width, even height, never upscale
SCALE="scale='min(${MAXW},iw)':-2:flags=lanczos"

optimize_mp4() {
  local f="$1"
  local tmp="${f%.*}.opt.mp4"
  echo "→ mp4  $f"
  # shellcheck disable=SC2046
  ffmpeg -loglevel error -y -i "$f" \
    -vf "$SCALE" \
    -c:v libx264 -crf "$CRF" -preset "$PRESET" -pix_fmt yuv420p \
    $(audio_args) \
    -movflags +faststart -map_metadata -1 \
    "$tmp"
  if [ -f "$tmp" ] && [ "$(filesize "$tmp")" -gt 0 ] && [ "$(filesize "$tmp")" -lt "$(filesize "$f")" ]; then
    mv "$tmp" "$f"
    echo "   saved (now $(filesize "$f") bytes)"
  else
    rm -f "$tmp"
    echo "   kept original (re-encode was not smaller)"
  fi
}

emit_webm() {
  [ "$WEBM" = "1" ] || return 0
  local f="$1"
  local out="${f%.*}.webm"
  echo "→ webm $out"
  ffmpeg -loglevel error -y -i "$f" \
    -vf "$SCALE" \
    -c:v libvpx-vp9 -crf 33 -b:v 0 -row-mt 1 \
    $([ "$AUDIO" = "none" ] && echo "-an" || echo "-c:a libopus -b:a 96k") \
    -map_metadata -1 \
    "$out"
}

gif_to_mp4() {
  local f="$1"
  local out="${f%.*}.mp4"
  echo "→ gif→mp4  $f"
  # yuv420p needs even dimensions; pad by 1px if odd.
  ffmpeg -loglevel error -y -i "$f" \
    -movflags +faststart -pix_fmt yuv420p \
    -vf "${SCALE},pad=ceil(iw/2)*2:ceil(ih/2)*2" \
    -c:v libx264 -crf "$CRF" -preset "$PRESET" -an \
    "$out"
  echo "   created $out ($(filesize "$out") bytes vs gif $(filesize "$f")). Original .gif kept; delete it once you've swapped the reference to .mp4."
}

process() {
  local f="$1"
  [ -f "$f" ] || { echo "skip (not a file): $f" >&2; return; }
  case "$(echo "$f" | tr '[:upper:]' '[:lower:]')" in
    *.gif)
      if [ "$GIF2MP4" = "1" ]; then gif_to_mp4 "$f"; else echo "skip gif (GIF2MP4=0): $f"; fi
      ;;
    *.mp4|*.mov|*.m4v|*.webm|*.mkv|*.avi)
      optimize_mp4 "$f"
      emit_webm "$f"
      ;;
    *)
      echo "skip (unsupported): $f"
      ;;
  esac
}

if [ "$#" -gt 0 ]; then
  for f in "$@"; do process "$f"; done
else
  echo "No files passed; scanning: ${SCAN_DIRS[*]}"
  while IFS= read -r -d '' f; do
    process "$f"
  done < <(find "${SCAN_DIRS[@]}" -type f \
            \( -iname '*.mp4' -o -iname '*.mov' -o -iname '*.m4v' \
               -o -iname '*.webm' -o -iname '*.mkv' -o -iname '*.avi' -o -iname '*.gif' \) \
            -print0 2>/dev/null)
fi

echo "Done."
