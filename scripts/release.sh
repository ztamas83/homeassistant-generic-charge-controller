#!/usr/bin/env bash
# Bump the version from the latest vX.Y.Z tag, commit the manifest, tag and push.
# The pushed tag starts the release workflow (.github/workflows/release.yml).
# Usage: scripts/release.sh patch|minor|major [beta]
set -euo pipefail

bump=${1:-}
beta=${2:-}
manifest=custom_components/generic_charge_controller/manifest.json

case "$bump" in
  patch | minor | major) ;;
  *) echo "Usage: make release BUMP=patch|minor|major [BETA=1]" >&2; exit 1 ;;
esac

[ "$(git branch --show-current)" = master ] || { echo "Not on master" >&2; exit 1; }
git diff --quiet HEAD || { echo "Working tree has uncommitted changes" >&2; exit 1; }
git fetch -q --tags origin master
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/master)" ] ||
  { echo "master differs from origin/master, pull or push first" >&2; exit 1; }

latest=$(git tag -l 'v*' --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -1 || true)
IFS=. read -r major minor patch <<< "${latest:-v0.0.0}"
major=${major#v}
case "$bump" in
  major) version="$((major + 1)).0.0" ;;
  minor) version="$major.$((minor + 1)).0" ;;
  patch) version="$major.$minor.$((patch + 1))" ;;
esac
if [ -n "$beta" ]; then
  n=$(git tag -l "v$version-beta.*" | wc -l)
  version="$version-beta.$((n + 1))"
fi

read -rp "Release v$version (previous ${latest:-none})? [y/N] " answer
[ "$answer" = y ] || { echo "Cancelled"; exit 1; }

jq --indent 2 --arg v "$version" '.version = $v' "$manifest" > "$manifest.tmp"
mv "$manifest.tmp" "$manifest"
git diff --quiet "$manifest" || git commit -m "Release v$version" "$manifest"
git tag -a "v$version" -m "v$version"
git push --atomic origin master "v$version"
echo "Pushed v$version, the release workflow publishes it: gh run watch"
