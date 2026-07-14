#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────────
# playwright-runner-hc-e2e.sh — Run Playwright projects on a hot (pre-provisioned)
#                                OpenShift cluster with ServiceAccount auth.
#
# Differences from playwright-runner.sh:
#   • Exports HC_E2E=true so global setup uses the in-cluster / SA-token auth
#     flow and skips browser OAuth login.
#   • Includes the Gating and Tier1 projects (scenario infrastructure).
#   • Supports IS_LOCAL=1 for localhost development (oc login + localhost:9000).
#
# Usage:
#   ./playwright-runner-hc-e2e.sh [project] [extra-args...]
#
# Environment:
#   IS_LOCAL=1   Run against localhost:9000 (npm run start-console).
#                Performs oc login from .env credentials and sets
#                WEB_CONSOLE_URL=http://localhost:9000 automatically.
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

  if [[ -z "${CLUSTER_URL:-}" ]]; then
    echo "❌ CLUSTER_URL is required for oc login. Set it in .env or export it."
    exit 1
  fi

  local user="${OPENSHIFT_USERNAME:-kubeadmin}"
  local pass="${OPENSHIFT_PASSWORD:-}"
  if [[ -z "${pass}" ]]; then
    echo "❌ OPENSHIFT_PASSWORD is required for oc login. Set it in .env or export it."
    exit 1
  fi

  echo "🔐 Logging in to ${CLUSTER_URL} as ${user}..."
  oc login "${CLUSTER_URL}" -u "${user}" -p "${pass}" --insecure-skip-tls-verify
  echo "✓ oc login successful ($(oc whoami))"
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
  echo "  migration-gating       Migration gating specs"
  echo "  migration-tier1        Migration tier 1 specs"
  echo "  migration-tier2        Tier 2 specs"
  echo "  migration-nonpriv      Non-privileged user specs"
  echo "  migration-migrations   Migration specs"
  echo "  migration-settings     Settings specs"
  echo "  all                    Run all projects"
  echo ""
  echo "Environment:"
  echo "  IS_LOCAL=1             Run against localhost:9000 (oc login + local console)"
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

if [[ "${PROJECT}" == "all" ]]; then
  PROJECTS=(
    Gating
    Tier1
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
  echo "🚀 Running all projects (HC E2E mode)..."
  npx playwright test "${PROJECT_ARGS[@]}" "${EXTRA_ARGS[@]}"
else
  echo "🚀 Running project: ${PROJECT} (HC E2E mode)..."
  npx playwright test --project "${PROJECT}" "${EXTRA_ARGS[@]}"
fi
