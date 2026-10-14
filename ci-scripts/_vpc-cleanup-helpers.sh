#!/bin/bash
#
# Shared helpers for VPC resource cleanup.
#
# Source this file; do not execute it directly.
#   source "$(dirname "${BASH_SOURCE[0]}")/../_vpc-cleanup-helpers.sh"
#
# Required env (set by the sourcing script):
#   CLUSTER_NAME   - name prefix for resource matching
#   DRY_RUN        - "true" to only list matching resources

# Wraps a mutating ibmcloud call: prints what would happen under DRY_RUN,
# otherwise runs it for real, tolerating failure (best-effort throughout).
run_or_dry() {
  if [[ "${DRY_RUN}" == "true" ]]; then
    echo "  [dry-run] would run: $*"
  else
    "$@" 2>&1 || echo "  WARNING: command failed: $*"
  fi
}

# How long to keep retrying a resource delete that's failing only because a
# dependent resource hasn't finished draining yet.
RETRY_BUDGET_SECONDS=600
RETRY_INTERVAL_SECONDS=30

# Generic polling deletion for IBM Cloud VPC resources that may be blocked
# by a dependent resource still draining (e.g. subnets blocked by IKS
# worker nodes, VPCs blocked by lingering subnets).
#
# Usage:
#   poll_delete_resource <list-cmd> <delete-cmd> <in-use-pattern> <label>
#
# Example:
#   poll_delete_resource "ibmcloud is subnets" "ibmcloud is subnet-delete" \
#     "subnet_in_use_iks_worker_node_exists" "subnet"
poll_delete_resource() {
  local list_cmd="$1"
  local delete_cmd="$2"
  local in_use_pattern="$3"
  local label="$4"

  if [[ "${DRY_RUN}" == "true" ]]; then
    (${list_cmd} --output json 2>/dev/null || echo '[]') \
      | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
      | while read -r id; do echo "  [dry-run] would run: ${delete_cmd} ${id} -f"; done
    return 0
  fi

  local deadline=$(($(date +%s) + RETRY_BUDGET_SECONDS))
  while true; do
    local resource_json
    if resource_json=$(${list_cmd} --output json 2>/dev/null); then
      local ids
      ids=$(echo "${resource_json}" \
        | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end')
      if [[ -z "${ids}" ]]; then
        return 0
      fi

      local blocked="false"
      while read -r id; do
        [[ -z "${id}" ]] && continue
        local out
        if out=$(${delete_cmd} "${id}" -f 2>&1); then
          echo "  Deleted ${label} ${id}"
        else
          echo "${out}"
          if echo "${out}" | grep -q "${in_use_pattern}"; then
            blocked="true"
          fi
        fi
      done <<<"${ids}"

      if [[ "${blocked}" == "true" ]]; then
        echo "  ${label^}(s) still in use, retrying in ${RETRY_INTERVAL_SECONDS}s..."
      fi
    else
      echo "  WARNING: '${list_cmd}' failed to list resources, will retry."
    fi

    if (($(date +%s) >= deadline)); then
      return 1
    fi
    sleep "${RETRY_INTERVAL_SECONDS}"
  done
}

# Builds a JSON array of VPC IDs matching startswith(CLUSTER_NAME).
# Sets STALE_VPC_FILTER (a jq-ready JSON array string).
collect_stale_vpc_ids() {
  local stale_vpc_ids
  stale_vpc_ids=$(ibmcloud is vpcs --output json 2>/dev/null \
    | jq -r --arg cn "${CLUSTER_NAME}" \
      'if type == "array" then [.[] | select(.name | startswith($cn)) | .id] else [] end | join("\n")' 2>/dev/null || true)
  if [[ -n "${stale_vpc_ids}" ]]; then
    STALE_VPC_FILTER=$(echo "${stale_vpc_ids}" | jq -R -s 'split("\n") | map(select(length > 0))')
  else
    STALE_VPC_FILTER='[]'
  fi
}

# Builds a JSON array of default security group IDs for VPCs matching
# startswith(CLUSTER_NAME). These cannot be deleted independently -- they
# are removed when the VPC itself is deleted.
# Sets DEFAULT_SG_FILTER (a jq-ready JSON array string).
collect_default_sg_ids() {
  local default_sg_ids
  default_sg_ids=$(ibmcloud is vpcs --output json 2>/dev/null \
    | jq -r --arg cn "${CLUSTER_NAME}" \
      'if type == "array" then [.[] | select(.name | startswith($cn)) | .default_security_group.id // empty] else [] end | join("\n")' 2>/dev/null || true)
  if [[ -n "${default_sg_ids}" ]]; then
    DEFAULT_SG_FILTER=$(echo "${default_sg_ids}" | jq -R -s 'split("\n") | map(select(length > 0))')
  else
    DEFAULT_SG_FILTER='[]'
  fi
}
