#!/bin/bash
#
# Shared helpers for gha-runner-scale-set Helm installs.
#

#
# GitHub auth for scale-set chart: arc_github_config_secret_helm_auth AUTH_ARGS
# Sets global AUTH_VALUES_FILE when authentication is used.
#
arc_github_config_secret_helm_auth() {
  local -n _auth_arr="${1:?auth args array name required}"
  _auth_arr=()
  AUTH_VALUES_FILE=""
  if [[ -n "${ARC_APP_ID:-}" && -n "${ARC_APP_INSTALL_ID:-}" && -n "${ARC_APP_PRIVATE_KEY:-}" ]]; then
    echo "Using GitHub App authentication"
    AUTH_VALUES_FILE=$(mktemp)
    {
      echo 'githubConfigSecret:'
      echo "  github_app_id: \"${ARC_APP_ID}\""
      echo "  github_app_installation_id: \"${ARC_APP_INSTALL_ID}\""
      echo '  github_app_private_key: |'
      echo "${ARC_APP_PRIVATE_KEY}" | sed 's/^/    /'
    } > "${AUTH_VALUES_FILE}"
    _auth_arr+=(--values "${AUTH_VALUES_FILE}")
  elif [[ -n "${ARC_PAT:-}" ]]; then
    echo "Using Personal Access Token authentication"
    AUTH_VALUES_FILE=$(mktemp)
    {
      echo 'githubConfigSecret:'
      echo "  github_token: \"${ARC_PAT}\""
    } > "${AUTH_VALUES_FILE}"
    _auth_arr+=(--values "${AUTH_VALUES_FILE}")
  else
    echo "ERROR: Set ARC_APP_ID + ARC_APP_INSTALL_ID + ARC_APP_PRIVATE_KEY, or ARC_PAT"
    return 1
  fi

  trap '[[ -n "${AUTH_VALUES_FILE:-}" && -f "${AUTH_VALUES_FILE}" ]] && rm -f "${AUTH_VALUES_FILE}"' EXIT
  return 0
}
