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

playwright_bootstrap_env() {
  playwright_source_dotenv "${1:-.env}"
  if [[ "${IS_LOCAL:-0}" == "1" || "${IS_LOCAL:-}" == "true" ]]; then
    playwright_apply_local_console_lane
  fi
}
