#!/bin/bash

# Automate environment validation for Azure/App Service deployments.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Installing npm dependencies..."
npm ci

echo "Running TypeScript checks..."
npm run check

echo "Building production bundle..."
npm run build

echo "Validation completed. Apply SQL migrations from sql/migrations/ and configure Azure environment variables before deployment."
