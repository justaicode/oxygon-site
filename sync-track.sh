#!/usr/bin/env sh
# Sync the live crew-tracking page from the Oxygon app repo (the source of
# truth) into this website repo, so oxygon.app/track/ serves the current
# version. The app mints links like oxygon.app/track/#<token>; that path is
# only live because this file is committed here and served by GitHub Pages.
#
# Usage:  ./sync-track.sh   (run from anywhere; assumes the app repo is a
#         sibling of this repo at ../Oxygon — the default on this machine)
#
# It used to read ../Dromeas. That path now holds a different app entirely — the
# offline calculator — which has no web/ directory at all, so the script failed
# outright rather than syncing. Failing loudly was the lucky outcome; the same
# rename could just as easily have pointed it at a real file from the wrong app.
#
# After running, review the diff and commit if it changed.
set -eu

# Resolve paths relative to this script's location, not the caller's CWD.
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
SRC="$SCRIPT_DIR/../Oxygon/web/track/index.html"
DEST="$SCRIPT_DIR/track/index.html"

if [ ! -f "$SRC" ]; then
  echo "ERROR: source not found: $SRC" >&2
  echo "Adjust SRC in sync-track.sh if the app repo lives elsewhere." >&2
  exit 1
fi

mkdir -p "$SCRIPT_DIR/track"
cp "$SRC" "$DEST"

if git -C "$SCRIPT_DIR" diff --quiet -- track/index.html 2>/dev/null; then
  echo "track/index.html is already up to date."
else
  echo "Updated track/index.html from the app repo. Review and commit:"
  echo "  git add track/index.html && git commit -m 'Sync /track/ from app repo'"
fi
