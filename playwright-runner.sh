#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# shellcheck source=scripts/playwright-env.sh
source "${SCRIPT_DIR}/scripts/playwright-env.sh"
playwright_bootstrap_env ".env"

usage() {
  cat <<'EOF'
Usage: ./playwright-runner.sh <project> [playwright test args...]

Projects (kubeadmin):
  Gating | gating          @gating
  Tier1  | tier1 | t1      @tier1
  Tier2  | tier2 | t2      @tier2
  auto                     all projects (pass through args)

Non-priv (test / test):
  Tier1NonPriv | tier1-nonpriv | t1-nonpriv
  Tier2NonPriv | tier2-nonpriv | t2-nonpriv

Local console — inline IS_LOCAL=1 wins over IS_LOCAL=0 in .env:
  IS_LOCAL=1 ./playwright-runner.sh gating --workers=4

Examples:
  ./playwright-runner.sh gating --workers=4
  ./playwright-runner.sh tier1 --workers=4
  ./playwright-runner.sh tier2 --workers=4
EOF
}

PROJECT="${1:-Gating}"
shift || true

case "${PROJECT}" in
  -h | --help | help)
    usage
    exit 0
    ;;
  gating | Gating)
    PROJECT="Gating"
    ;;
  tier1 | t1 | Tier1)
    PROJECT="Tier1"
    ;;
  tier2 | t2 | Tier2)
    PROJECT="Tier2"
    ;;
  tier1-nonpriv | t1-nonpriv | Tier1NonPriv)
    PROJECT="Tier1NonPriv"
    export NON_PRIV=1
    export TEST_USERNAME="${TEST_USERNAME:-test}"
    export TEST_PASSWORD="${TEST_PASSWORD:-test}"
    export TEST_IDP="${TEST_IDP:-test-users}"
    export HEADLESS="${HEADLESS:-true}"
    ;;
  tier2-nonpriv | t2-nonpriv | Tier2NonPriv)
    PROJECT="Tier2NonPriv"
    export NON_PRIV=1
    export TEST_USERNAME="${TEST_USERNAME:-test}"
    export TEST_PASSWORD="${TEST_PASSWORD:-test}"
    export TEST_IDP="${TEST_IDP:-test-users}"
    export HEADLESS="${HEADLESS:-true}"
    ;;
esac

if [[ "${PROJECT}" != "auto" ]]; then
  exec ./scripts/run-playwright.sh "--project=${PROJECT}" "$@"
fi

exec ./scripts/run-playwright.sh "$@"
