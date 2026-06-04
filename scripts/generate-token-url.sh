#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config.env"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "ERROR: config.env not found at $CONFIG_FILE" >&2
  exit 1
fi

set -a
source "$CONFIG_FILE"
set +a

TOKEN_KEY="${BUNNY_TOKEN_KEY:-}"
PULL_ZONE_HOST="${BUNNY_PULL_ZONE_HOST:-}"

generate_md5_token() {
  local path="$1"
  local expires_seconds="${2:-3600}"
  local ip="${3:-}"

  if [ -z "$TOKEN_KEY" ] || [ -z "$PULL_ZONE_HOST" ]; then
    echo "ERROR: Set BUNNY_TOKEN_KEY and BUNNY_PULL_ZONE_HOST in config.env" >&2
    exit 1
  fi

  local expires
  expires=$(($(date +%s) + expires_seconds))

  local hash_input="${TOKEN_KEY}${path}${expires}"
  if [ -n "$ip" ]; then
    hash_input="${hash_input}${ip}"
  fi

  local token
  token=$(echo -n "$hash_input" | md5 -s 2>/dev/null || echo -n "$hash_input" | md5sum | cut -d' ' -f1)

  local url="https://${PULL_ZONE_HOST}${path}?token=${token}&expires=${expires}"
  if [ -n "$ip" ]; then
    url="${url}&ip=${ip}"
  fi

  echo "$url"
}

generate_sha256_token() {
  local path="$1"
  local expires_seconds="${2:-3600}"
  local ip="${3:-}"
  local countries="${4:-}"
  local speed_limit="${5:-}"

  if [ -z "$TOKEN_KEY" ] || [ -z "$PULL_ZONE_HOST" ]; then
    echo "ERROR: Set BUNNY_TOKEN_KEY and BUNNY_PULL_ZONE_HOST in config.env" >&2
    exit 1
  fi

  local expires
  expires=$(($(date +%s) + expires_seconds))

  local security_params="expires=${expires}"
  local hash_input="${TOKEN_KEY}${path}"

  if [ -n "$ip" ]; then
    security_params="${security_params}~ip=${ip}"
    hash_input="${hash_input}${ip}"
  fi
  if [ -n "$countries" ]; then
    security_params="${security_params}~countries=${countries}"
    hash_input="${hash_input}${countries}"
  fi
  if [ -n "$speed_limit" ]; then
    security_params="${security_params}~speedLimit=${speed_limit}"
    hash_input="${hash_input}${speed_limit}"
  fi

  hash_input="${hash_input}${expires}"

  local token
  if command -v sha256sum &>/dev/null; then
    token=$(echo -n "$hash_input" | sha256sum | cut -d' ' -f1)
  elif command -v shasum &>/dev/null; then
    token=$(echo -n "$hash_input" | shasum -a 256 | cut -d' ' -f1)
  else
    echo "ERROR: sha256sum or shasum required" >&2
    exit 1
  fi

  local url="https://${PULL_ZONE_HOST}${path}?token=${token}&${security_params}"
  echo "$url"
}

if [ "${1:-}" = "--md5" ]; then
  shift
  generate_md5_token "$@"
else
  generate_sha256_token "$@"
fi
