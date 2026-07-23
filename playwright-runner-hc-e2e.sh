#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────────
# playwright-runner-hc-e2e.sh — Run Playwright projects on a hot (pre-provisioned)
#                                OpenShift cluster with ServiceAccount auth.
#
# Differences from playwright-runner.sh:
#   • Exports HC_E2E=true so global setup uses the in-cluster / SA-token auth
#     flow and skips browser OAuth login.
#   • Includes the Gating and Tier1 projects (scenario infrastructure).
#   • Supports IS_LOCAL=1 for localhost development (localhost:9000).
#
# Usage:
#   ./playwright-runner-hc-e2e.sh [project] [extra-args...]
#
# Environment:
#   IS_LOCAL=1   Run against localhost:9000 (npm run start-console).
#                Sets WEB_CONSOLE_URL=http://localhost:9000 automatically.
#
# Examples:
#   ./playwright-runner-hc-e2e.sh Gating --workers=4
#   IS_LOCAL=1 ./playwright-runner-hc-e2e.sh Gating --headed
#   ./playwright-runner-hc-e2e.sh all
# ────────────────────────────────────────────────────────────────────────────
set -euo pipefail

export HC_E2E=true

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"
cd "${PROJECT_ROOT}"

# ── Helpers ──────────────────────────────────────────────────────────────

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

setup_local() {
  export WEB_CONSOLE_URL="http://localhost:9000"
  echo "🏠 IS_LOCAL=1 — targeting localhost console at ${WEB_CONSOLE_URL}"
  detect_urls
}

# ── Main ─────────────────────────────────────────────────────────────────

PROJECT="${1:-}"
shift || true

if [[ -z "${PROJECT}" ]]; then
  echo "Usage: $0 <project> [extra-args...]"
  echo ""
  echo "Available projects:"
  echo "  Gating                 Gating specs (scenario infrastructure)"
  echo "  Tier1                  Tier 1 specs (scenario infrastructure)"
  echo "  Tier2                  Tier 2 specs (scenario infrastructure)"
  echo "  Settings               Settings specs (scenario infrastructure)"
  echo "  API                    API contract tests (browserless)"
  echo "  suite                  Run Gating + Tier1 + Tier2 together"
  echo "  all                    Run all projects"
  echo ""
  echo "Environment:"
  echo "  IS_LOCAL=1             Run against localhost:9000 (local console)"
  exit 1
fi

# Load .env if present
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${PROJECT_ROOT}/.env"
  set +a
fi

if [[ "${IS_LOCAL:-}" == "1" ]]; then
  setup_local
  export HEADLESS="${HEADLESS:-true}"
else
  detect_urls
fi

EXTRA_ARGS=("$@")

PROJECT_LOWER=$(echo "${PROJECT}" | tr '[:upper:]' '[:lower:]')

if [[ "${PROJECT_LOWER}" == "gating" || "${PROJECT_LOWER}" == "suite" ]]; then
  echo "🚀 Running suite: Gating + Tier1 + Tier2 (HC E2E mode)..."
  npx playwright test --project Gating --project Tier1 --project Tier2 "${EXTRA_ARGS[@]}"
elif [[ "${PROJECT_LOWER}" == "all" ]]; then
  PROJECTS=(
    Gating
    Tier1
    Tier2
    Settings
    API
  )
  PROJECT_ARGS=()
  for p in "${PROJECTS[@]}"; do
    PROJECT_ARGS+=(--project "${p}")
  done
  echo "🚀 Running all projects (HC E2E mode)..."
  npx playwright test "${PROJECT_ARGS[@]}" "${EXTRA_ARGS[@]}"
else
  echo "🚀 Running project: ${PROJECT} (HC E2E mode)..."
  npx playwright test --project "${PROJECT}" "${EXTRA_ARGS[@]}"
fi
