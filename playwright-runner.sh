#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# shellcheck source=scripts/playwright-env.sh
source "${SCRIPT_DIR}/scripts/playwright-env.sh"
playwright_bootstrap_env ".env"

usage() {
  cat <<'EOF'
Usage: ./playwright-runner.sh [gating] [playwright test args...]

Project:
  Gating | gating              @gating (default)

Local console — inline IS_LOCAL=1 wins over IS_LOCAL=0 in .env:
  IS_LOCAL=1 ./playwright-runner.sh gating --workers=4

CI debug harness (failures → skipped) — off by default; opt in with:
  CI_DEBUG=1 ./playwright-runner.sh gating --workers=4

Examples:
  ./playwright-runner.sh
  ./playwright-runner.sh gating --workers=4
EOF
}

# CI safety harness off by default (hard failures). Opt in with CI_DEBUG=1.
export CI_DEBUG="${CI_DEBUG:-0}"

PROJECT="Gating"
if [[ $# -gt 0 ]]; then
  case "${1}" in
    -h | --help | help)
      usage
      exit 0
      ;;
    gating | Gating)
      PROJECT="Gating"
      shift
      ;;
    --*)
      # Playwright flags only — keep default Gating project.
      ;;
    *)
      echo "Unknown project '${1}'. Only Gating is supported." >&2
      usage >&2
      exit 1
      ;;
  esac
fi

exec ./scripts/run-playwright.sh "--project=${PROJECT}" "$@"
