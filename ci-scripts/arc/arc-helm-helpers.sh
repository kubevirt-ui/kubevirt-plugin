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

#
# Multilabel (ARC 0.14+): optional comma-separated ARC_SCALE_SET_LABELS — workflows must use
#   runs-on: [label1, label2, ...] matching every label (see HOT_CLUSTER_CI.md).
#
arc_helm_append_scale_set_labels() {
  local -n _helm_arr="${1:?helm args array name required}"
  [[ -z "${ARC_SCALE_SET_LABELS:-}" ]] && return 0
  local json="["
  local first=1
  local lab
  IFS=',' read -ra _arc_ssl <<< "${ARC_SCALE_SET_LABELS}"
  for lab in "${_arc_ssl[@]}"; do
    lab="${lab//[[:space:]]/}"
    [[ -z "$lab" ]] && continue
    [[ $first -eq 0 ]] && json+=","
    first=0
    json+="\"${lab//\"/\\\"}\""
  done
  json+="]"
  if [[ $first -eq 1 ]]; then
    return 0
  fi
  echo "Scale set labels (multilabel): ${ARC_SCALE_SET_LABELS}"
  _helm_arr+=(--set-json "scaleSetLabels=${json}")
}
