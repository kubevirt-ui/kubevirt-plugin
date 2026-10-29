#!/usr/bin/env bash
# Shared Playwright env: load `.env` without clobbering inline exports (e.g. IS_LOCAL=1).
# Sourced by playwright-runner.sh and scripts/run-playwright.sh.

playwright_source_dotenv() {
  local file="${1:-.env}"
  [[ -f "$file" ]] || return 0

  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      local key="${BASH_REMATCH[1]}"
      local value="${BASH_REMATCH[2]}"
      value="${value#"${value%%[![:space:]]*}"}"
      value="${value%"${value##*[![:space:]]}"}"
      if [[ "$value" == \"*\" && "$value" == *\" ]]; then
        value="${value:1:${#value}-2}"
      elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
        value="${value:1:${#value}-2}"
      fi
      if [[ -z "${!key+x}" ]]; then
        export "$key=$value"
      fi
    fi
  done < "$file"
}

playwright_apply_local_console_lane() {
  export IS_LOCAL=1
  export WEB_CONSOLE_URL=http://localhost:9000
  export SKIP_OC_LOGIN=1
  export SKIP_CLUSTER_PREP=1
  export SKIP_NONPRIV_IDP_SETUP=1
  export SKIP_GLOBAL_TEARDOWN=true
  export REUSE_STORAGE_STATE=1
}

# Prow/Jenkins (release-4.12 style): BRIDGE_* from test-prow-e2e.sh → Playwright env; fresh login each run.
playwright_bootstrap_ci_env() {
  if [[ "${CI:-}" != "1" && "${CI:-}" != "true" ]]; then
    return 0
  fi
  export IS_LOCAL=0
  if [[ -n "${BRIDGE_BASE_ADDRESS:-}" ]]; then
    export WEB_CONSOLE_URL="${WEB_CONSOLE_URL:-$BRIDGE_BASE_ADDRESS}"
  fi
  if [[ -n "${BRIDGE_KUBEADMIN_PASSWORD:-}" ]]; then
    export OPENSHIFT_PASSWORD="${OPENSHIFT_PASSWORD:-$BRIDGE_KUBEADMIN_PASSWORD}"
  fi
  unset REUSE_STORAGE_STATE
}

playwright_bootstrap_env() {
  playwright_source_dotenv "${1:-.env}"
  playwright_bootstrap_ci_env
  if [[ "${IS_LOCAL:-0}" == "1" || "${IS_LOCAL:-}" == "true" ]]; then
    playwright_apply_local_console_lane
  fi
}
