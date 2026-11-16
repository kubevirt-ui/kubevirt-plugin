#!/usr/bin/env bash
# Hot-cluster Playwright runner — same CLI shape as playwright-runner.sh / CNV-98979,
# with HC_E2E=true and hard failures (CI_DEBUG off by default).
set -euo pipefail

export HC_E2E=true

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# shellcheck source=scripts/playwright-env.sh
source "${SCRIPT_DIR}/scripts/playwright-env.sh"
playwright_bootstrap_env ".env"

detect_urls() {
  if [[ -z "${WEB_CONSOLE_URL:-}" ]]; then
    if [[ -n "${CLUSTER_NAME:-}" && -n "${CLUSTER_DOMAIN:-}" ]]; then
      export WEB_CONSOLE_URL="https://console-openshift-console.apps.${CLUSTER_NAME}.${CLUSTER_DOMAIN}"
      echo "ℹ️  Derived WEB_CONSOLE_URL=${WEB_CONSOLE_URL}"
    fi
  fi

  if [[ -z "${CLUSTER_URL:-}" && -n "${WEB_CONSOLE_URL:-}" ]]; then
    local apps_domain
    apps_domain=$(echo "${WEB_CONSOLE_URL}" | sed -n 's|.*console-openshift-console\.apps\.\(.*\)|\1|p' | sed 's|/$||')
    if [[ -n "${apps_domain}" ]]; then
      export CLUSTER_URL="https://api.${apps_domain}:6443"
      echo "ℹ️  Derived CLUSTER_URL=${CLUSTER_URL}"
    fi
  fi
}

usage() {
  cat <<'EOF'
Usage: ./playwright-runner-hc-e2e.sh <project> [playwright test args...]

Projects (kubeadmin):
  Gating | gating              @gating (excludes @cnv-settings / @migration)
  Tier1  | tier1 | t1          @tier1
  Tier2  | tier2 | t2          @tier2
  Settings | settings          @cnv-settings
  Migrations | migrations      @migration
  auto                         all projects (pass through args)
  suite                        Gating + Tier1 + Tier2
  all                          Gating, Tier1, Tier2, Settings, API

Non-priv (test / test):
  Tier1NonPriv | tier1-nonpriv | t1-nonpriv
  Tier2NonPriv | tier2-nonpriv | t2-nonpriv

Local console — inline IS_LOCAL=1 wins over IS_LOCAL=0 in .env:
  IS_LOCAL=1 ./playwright-runner-hc-e2e.sh gating --workers=4

Hard failures by default (HC CI). Opt into the debug harness with:
  CI_DEBUG=1 ./playwright-runner-hc-e2e.sh gating --workers=4

Examples:
  ./playwright-runner-hc-e2e.sh gating --workers=4
  ./playwright-runner-hc-e2e.sh tier1 --workers=4
EOF
}

PROJECT="${1:-Gating}"
shift || true

# HC gating expects hard failures; callers can opt into CI_DEBUG=1.
export CI_DEBUG="${CI_DEBUG:-0}"

if [[ "${IS_LOCAL:-}" != "1" && "${IS_LOCAL:-}" != "true" ]]; then
  detect_urls
fi

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
  suite)
    echo "🚀 Running suite: Gating + Tier1 + Tier2 (HC E2E mode)..."
    exec ./scripts/run-playwright.sh \
      --project=Gating --project=Tier1 --project=Tier2 \
      "$@"
    ;;
  all)
    echo "🚀 Running all projects (HC E2E mode)..."
    exec ./scripts/run-playwright.sh \
      --project=Gating --project=Tier1 --project=Tier2 \
      --project=Settings --project=API \
      "$@"
    ;;
  auto)
    if [[ $# -eq 0 ]]; then
      echo "❌ Project 'auto' requires filter args (spec path or -g)."
      exit 1
    fi
    echo "🚀 Running Playwright without --project filter (HC E2E mode)..."
    exec ./scripts/run-playwright.sh "$@"
    ;;
esac

if [[ "${PROJECT}" != "auto" ]]; then
  echo "🚀 Running project: ${PROJECT} (HC E2E mode)..."
  exec ./scripts/run-playwright.sh "--project=${PROJECT}" "$@"
fi

exec ./scripts/run-playwright.sh "$@"
