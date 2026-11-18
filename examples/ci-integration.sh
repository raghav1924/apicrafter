#!/usr/bin/env bash
set -euo pipefail

echo "⚡ Running ApiCrafter CI validation pipeline..."
node dist/bin.js --version
echo "✔ ApiCrafter executable verified."
