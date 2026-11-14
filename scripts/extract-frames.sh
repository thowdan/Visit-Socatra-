#!/bin/sh
# Converts the hero video into a webp frame sequence + converts the hero still.
# Needs ffmpeg + cwebp (brew install ffmpeg webp).
set -e
SRC="Hero section/gemini_generated_video_61A4D28F.mov"
OUT="public/frames"
TMP="$(mktemp -d)"
rm -f "$OUT"/*.webp
ffmpeg -v error -i "$SRC" -vf "scale=1280:-2" -q:v 2 "$TMP/f_%03d.jpg"
for f in "$TMP"/*.jpg; do
  cwebp -quiet -q 72 -m 6 "$f" -o "$OUT/$(basename "${f%.jpg}").webp"
done
rm -rf "$TMP"
echo "frames: $(ls "$OUT" | wc -l)"
cwebp -quiet -q 85 "Hero section/1EBFFDC4-67D8-470E-83A9-113650463BC2.jpg" -o public/img/hero-foreground.webp
# poster still (first frame) for reduced-motion / no-WebGL fallback
cp "$OUT/f_001.webp" public/img/hero-poster.webp
