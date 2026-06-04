#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INTERVAL_SECONDS="${1:-60}"

echo "Starting capture loop every ${INTERVAL_SECONDS}s..."
echo "Press Ctrl+C to stop."
echo ""

while true; do
  bash "${SCRIPT_DIR}/capture-upload.sh"
  sleep "$INTERVAL_SECONDS"
done
