#!/usr/bin/env bash
# Run a Playwright project until it passes (or max attempts). workers=1 for stability.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

PROJECT="${1:?usage: playwright-stability-cycle.sh <gating|tier1|tier2> [max_attempts]}"
MAX_ATTEMPTS="${2:-3}"
LOG_DIR="${ROOT}/junit-results"
mkdir -p "${LOG_DIR}"

export HEADLESS="${HEADLESS:-true}"

# shellcheck source=playwright-env.sh
source "${ROOT}/scripts/playwright-env.sh"
playwright_bootstrap_env ".env"

attempt=1
while (( attempt <= MAX_ATTEMPTS )); do
  log="${LOG_DIR}/${PROJECT}-stability-attempt-${attempt}.log"
  echo "=== ${PROJECT} attempt ${attempt}/${MAX_ATTEMPTS} ($(date -Is)) ===" | tee "${log}"
  set +e
  ./playwright-runner.sh "${PROJECT}" --workers=1 >>"${log}" 2>&1
  exit_code=$?
  set -e
  if (( exit_code == 0 )); then
    echo "PASS: ${PROJECT} stable on attempt ${attempt}" | tee -a "${log}"
    exit 0
  fi
  echo "FAIL: ${PROJECT} attempt ${attempt} (exit ${exit_code}) — log: ${log}" >&2
  tail -30 "${log}" >&2 || true
  attempt=$((attempt + 1))
  sleep 5
done

echo "Gave up after ${MAX_ATTEMPTS} attempts for ${PROJECT}" >&2
exit 1
