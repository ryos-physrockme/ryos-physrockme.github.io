#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ $# -ne 1 || "$1" != *:* ]]; then
  echo 'Usage: bash scripts/deploy-lab.sh user@host:/absolute/web/directory/' >&2
  exit 2
fi
node scripts/export.mjs
# Use the SSH agent or normal interactive password prompt. Preserve remote files.
scp -r dist/. "$1"
