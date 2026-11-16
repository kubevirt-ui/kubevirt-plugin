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
  Gating | gating              @gating (excludes @cnv-settings / @migration)
  Tier1  | tier1 | t1          @tier1
  Tier2  | tier2 | t2          @tier2
  Settings | settings          @cnv-settings
  Migrations | migrations      @migration
  auto                         all projects (pass through args)

Non-priv (test / test):
  Tier1NonPriv | tier1-nonpriv | t1-nonpriv
  Tier2NonPriv | tier2-nonpriv | t2-nonpriv

Local console — inline IS_LOCAL=1 wins over IS_LOCAL=0 in .env:
  IS_LOCAL=1 ./playwright-runner.sh gating --workers=4

CI debug harness (failures → skipped) — enabled by default via this runner:
  CI_DEBUG=0 ./playwright-runner.sh tier1 --workers=4   # hard failures

Examples:
  ./playwright-runner.sh gating --workers=4
  ./playwright-runner.sh tier1 --workers=4
  ./playwright-runner.sh tier2 --workers=4
  ./playwright-runner.sh settings --workers=1
  ./playwright-runner.sh migrations --workers=2
EOF
}

PROJECT="${1:-Gating}"
shift || true

# Opt-in harness: off for direct npx/scripts/run-playwright.sh; on for all runner tiers.
export CI_DEBUG="${CI_DEBUG:-1}"

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
  settings | Settings)
    PROJECT="Settings"
    ;;
  migrations | Migrations)
    PROJECT="Migrations"
    ;;
  tier1-nonpriv | t1-nonpriv | Tier1NonPriv)
    PROJECT="Tier1NonPriv"
    export NON_PRIV=1
    export TEST_USERNAME="${TEST_USERNAME:-test}"
    export TEST_PASSWORD="${TEST_PASSWORD:-test}"
    # EnvVariables.testUserPassword reads TEST_USER_PASSWORD first; keep both in sync.
    export TEST_USER_PASSWORD="${TEST_USER_PASSWORD:-$TEST_PASSWORD}"
    export TEST_IDP="${TEST_IDP:-test-users}"
    export HEADLESS="${HEADLESS:-true}"
    ;;
  tier2-nonpriv | t2-nonpriv | Tier2NonPriv)
    PROJECT="Tier2NonPriv"
    export NON_PRIV=1
    export TEST_USERNAME="${TEST_USERNAME:-test}"
    export TEST_PASSWORD="${TEST_PASSWORD:-test}"
    export TEST_USER_PASSWORD="${TEST_USER_PASSWORD:-$TEST_PASSWORD}"
    export TEST_IDP="${TEST_IDP:-test-users}"
    export HEADLESS="${HEADLESS:-true}"
    ;;
esac

if [[ "${PROJECT}" != "auto" ]]; then
  exec ./scripts/run-playwright.sh "--project=${PROJECT}" "$@"
fi

exec ./scripts/run-playwright.sh "$@"
