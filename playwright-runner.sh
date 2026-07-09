#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────────
# playwright-runner.sh — Run migration Playwright projects for kubevirt-plugin
#
# Usage:
#   ./playwright-runner.sh [project] [extra-args...]
#
# Examples:
#   ./playwright-runner.sh migration-gating
#   ./playwright-runner.sh migration-tier1 --workers=2
#   ./playwright-runner.sh migration-nonpriv --headed
#   ./playwright-runner.sh all
# ────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"
cd "${PROJECT_ROOT}"

# ── Helpers ──────────────────────────────────────────────────────────────

detect_urls() {
  # Derive WEB_CONSOLE_URL from CLUSTER_NAME + CLUSTER_DOMAIN if not already set
  if [[ -z "${WEB_CONSOLE_URL:-}" ]]; then
    if [[ -n "${CLUSTER_NAME:-}" && -n "${CLUSTER_DOMAIN:-}" ]]; then
      export WEB_CONSOLE_URL="https://console-openshift-console.apps.${CLUSTER_NAME}.${CLUSTER_DOMAIN}"
      echo "ℹ️  Derived WEB_CONSOLE_URL=${WEB_CONSOLE_URL}"
    fi
  fi

  # Derive CLUSTER_URL from WEB_CONSOLE_URL if not already set
  if [[ -z "${CLUSTER_URL:-}" && -n "${WEB_CONSOLE_URL:-}" ]]; then
    local apps_domain
    apps_domain=$(echo "${WEB_CONSOLE_URL}" | sed -n 's|.*console-openshift-console\.apps\.\(.*\)|\1|p' | sed 's|/$||')
    if [[ -n "${apps_domain}" ]]; then
      export CLUSTER_URL="https://api.${apps_domain}:6443"
      echo "ℹ️  Derived CLUSTER_URL=${CLUSTER_URL}"
    fi
  fi
}

# ── Main ─────────────────────────────────────────────────────────────────

PROJECT="${1:-}"
shift || true

if [[ -z "${PROJECT}" ]]; then
  echo "Usage: $0 <project> [extra-args...]"
  echo ""
  echo "Available projects:"
  echo "  migration-gating       Gating specs"
  echo "  migration-tier1        Tier 1 specs"
  echo "  migration-tier2        Tier 2 specs"
  echo "  migration-nonpriv      Non-privileged user specs"
  echo "  migration-migrations   Migration specs"
  echo "  migration-settings     Settings specs"
  echo "  all                    Run all migration projects"
  exit 1
fi

# Load .env if present
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${PROJECT_ROOT}/.env"
  set +a
fi

detect_urls

EXTRA_ARGS=("$@")

if [[ "${PROJECT}" == "all" ]]; then
  PROJECTS=(
    migration-gating
    migration-tier1
    migration-tier2
    migration-nonpriv
    migration-migrations
    migration-settings
  )
  PROJECT_ARGS=()
  for p in "${PROJECTS[@]}"; do
    PROJECT_ARGS+=(--project "${p}")
  done
  echo "🚀 Running all migration projects..."
  npx playwright test "${PROJECT_ARGS[@]}" "${EXTRA_ARGS[@]}"
else
  echo "🚀 Running project: ${PROJECT}..."
  npx playwright test --project "${PROJECT}" "${EXTRA_ARGS[@]}"
fi
