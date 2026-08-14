#!/bin/sh
set -eu

app="${FLY_APP:-northstar-education}"

if [ "${1:-}" = "" ]; then
  printf "Usage: %s 'new-password'\n" "$0" >&2
  exit 1
fi

fly secrets set TEAM_ADVISORY_PASSWORD="$1" --app "$app"
printf "Updated team advising password for %s.\n" "$app"
