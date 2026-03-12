#!/bin/bash

# Automate environment validation for Azure/App Service deployments.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

run_step() {
  local label="$1"
  shift

  echo "$label"
  if ! "$@"; then
    echo "Step failed: $label" >&2
    exit 1
  fi
}

run_step "Installing npm dependencies..." npm ci
run_step "Running TypeScript checks..." npm run check
run_step "Building production bundle..." npm run build:azure

echo "Validation completed. Apply SQL migrations from sql/migrations/ and configure Azure environment variables before deployment."
