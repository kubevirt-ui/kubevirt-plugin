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

#
# Post-renders gha-runner-scale-set dind manifests: optional docker:dind → mirror
# (ci-scripts/generated/arc-dind-replace.env), and always injects --storage-driver=vfs
# so dockerd works on OpenShift (nested overlay otherwise fails with EINVAL).
#
# Usage: arc_helm_append_dind_post_renderer RUNNER_SET_ARGS "${ARC_DIR}" "${CI_SCRIPTS_DIR}"
# Env: ARC_USE_DIND_POST_RENDER=0 to disable.
#
arc_helm_append_dind_post_renderer() {
  local -n _helm_arr="${1:?helm args array name required}"
  local arc_dir="${2:?arc directory required}"
  local ci_scripts_dir="${3:?ci-scripts directory required}"
  local env_file="${ci_scripts_dir}/generated/arc-dind-replace.env"
  local pr_script="${arc_dir}/arc-dind-post-render.sh"
  [[ "${ARC_USE_DIND_POST_RENDER:-1}" == "0" ]] && return 0
  [[ ! -f "${pr_script}" ]] && return 0
  if [[ -f "${env_file}" ]]; then
    echo "Helm post-renderer: docker:dind mirror (${env_file}) + dind vfs (OpenShift)"
  else
    echo "Helm post-renderer: dind --storage-driver=vfs (OpenShift / nested overlay)"
  fi
  _helm_arr+=(--post-renderer "${pr_script}")
}
