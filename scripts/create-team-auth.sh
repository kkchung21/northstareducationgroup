#!/bin/sh
set -eu

password="${TEAM_ADVISORY_PASSWORD:-}"

if [ -z "$password" ]; then
  password="$(head -c 24 /dev/urandom | base64)"
  echo "TEAM_ADVISORY_PASSWORD is not set; generated a temporary password for this container."
fi

htpasswd -bc /etc/nginx/.team.htpasswd northstar "$password" >/dev/null
