#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config.env"
TEMP_DIR="${TMPDIR:-/tmp}/dogdad-captures"

mkdir -p "$TEMP_DIR"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "ERROR: config.env not found at $CONFIG_FILE" >&2
  exit 1
fi

set -a
source "$CONFIG_FILE"
set +a

REGION_MAP="de:storage.bunnycdn.com ny:ny.storage.bunnycdn.com la:la.storage.bunnycdn.com sg:sg.storage.bunnycdn.com syd:syd.storage.bunnycdn.com"
STORAGE_HOST=$(echo "$REGION_MAP" | grep -oP "${BUNNY_STORAGE_REGION}:\K[^ ]+" || echo "storage.bunnycdn.com")

upload_frame() {
  local room_name="$1"
  local rtsp_url="$2"
  local temp_file="${TEMP_DIR}/${room_name}.jpg"
  local remote_path="feeds/${room_name}/latest.jpg"

  ffmpeg -y -rtsp_transport tcp -i "$rtsp_url" \
    -vframes 1 -q:v 5 -timeout 5000000 \
    "$temp_file" 2>/dev/null

  if [ ! -f "$temp_file" ]; then
    echo "[$(date -Iseconds)] ERROR: ffmpeg failed to capture frame for ${room_name}" >&2
    return 1
  fi

  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X PUT \
    -H "AccessKey: ${BUNNY_API_KEY}" \
    -H "Content-Type: application/octet-stream" \
    --data-binary "@${temp_file}" \
    "https://${STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${remote_path}")

  if [ "$http_code" = "201" ]; then
    echo "[$(date -Iseconds)] OK: ${room_name} uploaded (HTTP ${http_code})"
  else
    echo "[$(date -Iseconds)] ERROR: ${room_name} upload failed (HTTP ${http_code})" >&2
    return 1
  fi
}

# Discover cameras from config
camera_count=0
while true; do
  room_var="CAMERA_ROOM${camera_count}_NAME"
  rtsp_var="CAMERA_ROOM${camera_count}_RTSP"
  camera_count=$((camera_count + 1))

  room_name="${!room_var:-}"
  rtsp_url="${!rtsp_var:-}"

  if [ -z "$room_name" ] || [ -z "$rtsp_url" ]; then
    break
  fi

  upload_frame "$room_name" "$rtsp_url"
done

if [ $camera_count -eq 1 ]; then
  echo "[$(date -Iseconds)] No cameras configured in config.env" >&2
fi
