# 1) Backup first
cp -R server/appMain server/appMain.images-backup

# 2) JPEGs: cap at 1600px wide (plenty for iPhone Retina), q≈80
find server/appMain capacitor/assets -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) -print0 |
while IFS= read -r -d '' f; do
  ffmpeg -loglevel error -y -i "$f" -vf "scale='min(1600,iw)':-2" -q:v 4 -map_metadata -1 "${f}.opt.jpg" \
    && [ "$(stat -f%z "${f}.opt.jpg")" -lt "$(stat -f%z "$f")" ] && mv "${f}.opt.jpg" "$f" || rm -f "${f}.opt.jpg"
done

# 3) PNGs: pngquant (lossy palette, preserves transparency, ~60-75% smaller)
find server/appMain capacitor/assets -type f -iname '*.png' -print0 |
  xargs -0 pngquant --quality=70-90 --skip-if-larger --force --ext .png

# 4) Rebuild the app bundle
cd capacitor && node scripts/build-www.js && npx cap sync ios