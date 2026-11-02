#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

# shellcheck source=playwright-env.sh
source "${ROOT}/scripts/playwright-env.sh"
playwright_bootstrap_env ".env"

exec ./node_modules/.bin/playwright test --config=playwright.config.ts "$@"
