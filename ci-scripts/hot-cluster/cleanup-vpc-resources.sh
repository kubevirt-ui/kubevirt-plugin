#!/usr/bin/env bash
set -euo pipefail

# Single source of truth for "delete every IBM Cloud VPC-infrastructure
# resource whose name starts with CLUSTER_NAME". Infra-type-agnostic --
# shared by ibmc-cluster-setup.yml, create-ipi-cluster.sh's retry loop,
# ibmc-cluster-teardown.yml, and ibmc-cleanup-all.yml.
#
# Required env: CLUSTER_NAME, IC_API_KEY
# Optional env:
#   ZONE                    - if set, re-targets the CLI to this zone's
#                              region first.
#   DRY_RUN                 - "true" to only list matching resources
#                              (default: "false").
#   CLEAN_VPC                - "false" to skip deleting the VPC itself,
#                              while still cleaning everything inside it
#                              (default: "true").
#   ALLOW_LIVE_CLUSTER_SWEEP - "true" to skip the cluster-liveness guard
#                              below (default: "false"). Only intended for
#                              a cluster that is already confirmed deleting.
#
# Exit code: when DRY_RUN is not "true", exits 1 if a matching subnet (or,
# with CLEAN_VPC=true, a matching VPC) is still present once cleanup
# completes -- e.g. because IKS worker nodes hadn't finished draining from
# the subnet within the retry budget below. Callers that intentionally
# want this to be a non-fatal, best-effort sweep (e.g. a pre-create
# proactive pass, or a retry loop that shouldn't be aborted by a
# transient leftover) should invoke this script with `|| true` or a
# GitHub Actions `continue-on-error: true` step.

export IC_API_KEY
DRY_RUN="${DRY_RUN:-false}"
CLEAN_VPC="${CLEAN_VPC:-true}"
ALLOW_LIVE_CLUSTER_SWEEP="${ALLOW_LIVE_CLUSTER_SWEEP:-false}"

# CLUSTER_NAME is set but unset -u only catches *unset* vars -- every
# resource-matching filter below is a startswith(CLUSTER_NAME) check, and
# every string starts with "". An empty CLUSTER_NAME would silently match
# (and delete) every resource in the account instead of failing loudly.
if [[ -z "${CLUSTER_NAME:-}" ]]; then
  echo "::error::CLUSTER_NAME must be set and non-empty -- refusing to run with an empty name, which would match every resource in the account."
  exit 1
fi

if [[ -n "${ZONE:-}" ]]; then
  VPC_REGION="${ZONE%-*}"
  ibmcloud target -r "${VPC_REGION}" 2>/dev/null || true
fi

# Cluster-liveness guard (defense-in-depth): this script deletes every VPC
# resource whose name starts with CLUSTER_NAME -- including a live
# cluster's public gateway, load balancer(s), and COS instance -- with no
# awareness of whether a ROKS cluster by that name is still running. Every
# call site is *expected* to only invoke this once the owning cluster is
# already gone, but relying on each call site to gate that correctly is
# exactly what failed previously: a teardown run selected the wrong
# infrastructure_type, skipped the ROKS-aware deletion steps entirely, and
# fell into an unconditional sweep here that deleted a live cluster's
# gateway/LB/COS while its worker nodes (and the subnet they're attached
# to) kept running -- see ibmc-cluster-teardown.yml's
# validate-teardown-infra-type.ts step. Check directly here too, so this
# script is safe no matter how it's invoked.
if [[ "${DRY_RUN}" != "true" && "${ALLOW_LIVE_CLUSTER_SWEEP}" != "true" ]]; then
  echo "0. Verifying no live ROKS cluster named '${CLUSTER_NAME}' still exists..."
  ibmcloud plugin install kubernetes-service -f >/dev/null 2>&1 || true
  # The $(...) assignment must be the direct condition of this `if` --
  # under `set -e`, a bare `CLUSTER_CHECK_OUTPUT=$(cmd)` statement exits
  # the whole script immediately whenever cmd fails (which is the normal,
  # expected outcome here whenever the cluster genuinely doesn't exist),
  # never reaching CLUSTER_CHECK_EXIT=$? or any of the branches below.
  if CLUSTER_CHECK_OUTPUT=$(ibmcloud oc cluster get --cluster "${CLUSTER_NAME}" 2>&1); then
    CLUSTER_CHECK_EXIT=0
  else
    CLUSTER_CHECK_EXIT=$?
  fi
  if [[ "${CLUSTER_CHECK_EXIT}" -eq 0 ]]; then
    echo "::error::Refusing to sweep VPC resources for '${CLUSTER_NAME}': a live ROKS cluster by this exact name still exists. This script deletes any resource whose name starts with CLUSTER_NAME -- including this cluster's public gateway, load balancer(s), and COS instance (--recursive) -- while leaving the ROKS cluster and its worker nodes untouched. If the ROKS cluster record should also be deleted, do that first (see 'Delete ROKS cluster' in ibmc-cluster-teardown.yml). If this sweep is expected to run alongside an already-in-progress cluster deletion, set ALLOW_LIVE_CLUSTER_SWEEP=true explicitly."
    exit 1
  elif ! echo "${CLUSTER_CHECK_OUTPUT}" | grep -q "could not be found"; then
    # Inconclusive (e.g. a transient API/auth hiccup, or the
    # kubernetes-service plugin failed to install) -- NOT the same as
    # confirmed-gone. Matches this codebase's existing philosophy for
    # this exact check elsewhere (check-roks-exists-teardown.ts,
    # delete-roks-cluster.ts): an ambiguous result must never be treated
    # as "safe to proceed" on a destructive, non-dry-run path -- stop
    # instead of risking a live cluster's resources on a guess. This
    # whole block is already skipped entirely when DRY_RUN=true, so
    # dry-run's preview-only behavior is unaffected.
    echo "::error::Could not conclusively determine whether a ROKS cluster named '${CLUSTER_NAME}' exists ('ibmcloud oc cluster get' failed for a reason other than 'could not be found'): ${CLUSTER_CHECK_OUTPUT}"
    exit 1
  else
    echo "  No live ROKS cluster named '${CLUSTER_NAME}' found -- safe to proceed."
  fi

  # The exact-name check above isn't enough on its own: every deletion
  # below matches by *prefix* (startswith(CLUSTER_NAME)), so a distinct,
  # concurrently-running cluster named e.g. "${CLUSTER_NAME}-91" would
  # still have its public gateway/LB/COS swept even though it's not the
  # exact-name cluster just checked. Same prefix-collision risk already
  # called out by ibmc-cleanup-all.yml's own "expected_cluster_count"
  # safety input.
  echo "  Checking for other live clusters sharing the '${CLUSTER_NAME}' name prefix..."
  # Fail closed, not open: listing/parsing errors here must never be
  # treated as "no collision found" -- that would silently let the
  # destructive sweep below proceed unchecked, the exact ambiguity this
  # whole guard exists to rule out. ibmcloud and jq failures are handled
  # as separate `if` conditions (not a bare assignment) so `set -e`
  # doesn't exit before either failure can be reported.
  # stderr is captured separately (not merged via 2>&1) so a successful
  # call's stdout stays pure JSON for jq below -- some ibmcloud commands
  # print CLI update/deprecation notices to stderr even on success, which
  # would otherwise corrupt ALL_CLUSTERS_JSON and cause a false "could not
  # parse" failure. Only read into the error message when the call fails.
  CLUSTER_LS_ERR_FILE=$(mktemp)
  if ! ALL_CLUSTERS_JSON=$(ibmcloud oc cluster ls --output json 2>"${CLUSTER_LS_ERR_FILE}"); then
    echo "::error::Could not list ROKS clusters to check for a name-prefix collision with '${CLUSTER_NAME}': $(cat "${CLUSTER_LS_ERR_FILE}")"
    rm -f "${CLUSTER_LS_ERR_FILE}"
    exit 1
  fi
  rm -f "${CLUSTER_LS_ERR_FILE}"
  if ! OTHER_PREFIX_MATCHES=$(echo "${ALL_CLUSTERS_JSON}" | jq -r --arg cn "${CLUSTER_NAME}" '[.[] | select(.name != $cn) | select(.name | startswith($cn)) | .name] | join(", ")' 2>&1); then
    echo "::error::Could not parse 'ibmcloud oc cluster ls' output to check for a name-prefix collision with '${CLUSTER_NAME}': ${OTHER_PREFIX_MATCHES}"
    exit 1
  fi
  if [[ -n "${OTHER_PREFIX_MATCHES}" ]]; then
    echo "::error::Refusing to sweep VPC resources for '${CLUSTER_NAME}': other live cluster(s) share this name prefix and would also be matched by this script's deletion filters (every jq filter below uses startswith(\"${CLUSTER_NAME}\")): ${OTHER_PREFIX_MATCHES}. Narrow CLUSTER_NAME, or tear down/rename those clusters first."
    exit 1
  fi
fi

# Wraps a mutating ibmcloud call: prints what would happen under DRY_RUN,
# otherwise runs it for real, tolerating failure (best-effort throughout).
run_or_dry() {
  if [[ "${DRY_RUN}" == "true" ]]; then
    echo "  [dry-run] would run: $*"
  else
    "$@" 2>&1 || echo "  WARNING: command failed: $*"
  fi
}

# How long to keep retrying a subnet/VPC delete that's failing only
# because a dependent resource (an IKS worker node still attached to the
# subnet, or an undeleted subnet still attached to the VPC) hasn't
# finished draining yet.
RETRY_BUDGET_SECONDS=600
RETRY_INTERVAL_SECONDS=30

# Repeatedly deletes every subnet matching CLUSTER_NAME, tolerating the
# transient "still has IKS worker nodes" error. Stops once none remain or
# the retry budget is exhausted.
poll_delete_subnets() {
  if [[ "${DRY_RUN}" == "true" ]]; then
    (ibmcloud is subnets --output json 2>/dev/null || echo '[]') \
      | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
      | while read -r id; do echo "  [dry-run] would run: ibmcloud is subnet-delete ${id} -f"; done
    return 0
  fi

  local deadline=$(($(date +%s) + RETRY_BUDGET_SECONDS))
  while true; do
    local subnets_json
    if subnets_json=$(ibmcloud is subnets --output json 2>/dev/null); then
      local ids
      ids=$(echo "${subnets_json}" \
        | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end')
      if [[ -z "${ids}" ]]; then
        return 0
      fi

      local blocked="false"
      while read -r id; do
        [[ -z "${id}" ]] && continue
        local out
        if out=$(ibmcloud is subnet-delete "${id}" -f 2>&1); then
          echo "  Deleted subnet ${id}"
        else
          echo "${out}"
          if echo "${out}" | grep -q "subnet_in_use_iks_worker_node_exists"; then
            blocked="true"
          fi
        fi
      done <<<"${ids}"

      if [[ "${blocked}" == "true" ]]; then
        echo "  Subnet(s) still in use by IKS worker nodes, retrying in ${RETRY_INTERVAL_SECONDS}s..."
      fi
    else
      # A failed listing call is NOT "no subnets left" -- don't let a
      # transient API error short-circuit this into a false success.
      echo "  WARNING: 'ibmcloud is subnets' failed to list resources, will retry."
    fi

    if (($(date +%s) >= deadline)); then
      return 1
    fi
    sleep "${RETRY_INTERVAL_SECONDS}"
  done
}

# Same idea for the VPC itself: retries while it's blocked by a subnet
# that hasn't finished deleting yet.
poll_delete_vpcs() {
  if [[ "${DRY_RUN}" == "true" ]]; then
    (ibmcloud is vpcs --output json 2>/dev/null || echo '[]') \
      | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
      | while read -r id; do echo "  [dry-run] would run: ibmcloud is vpc-delete ${id} -f"; done
    return 0
  fi

  local deadline=$(($(date +%s) + RETRY_BUDGET_SECONDS))
  while true; do
    local vpcs_json
    if vpcs_json=$(ibmcloud is vpcs --output json 2>/dev/null); then
      local ids
      ids=$(echo "${vpcs_json}" \
        | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end')
      if [[ -z "${ids}" ]]; then
        return 0
      fi

      local blocked="false"
      while read -r id; do
        [[ -z "${id}" ]] && continue
        local out
        if out=$(ibmcloud is vpc-delete "${id}" -f 2>&1); then
          echo "  Deleted VPC ${id}"
        else
          echo "${out}"
          if echo "${out}" | grep -q "vpc_in_use"; then
            blocked="true"
          fi
        fi
      done <<<"${ids}"

      if [[ "${blocked}" == "true" ]]; then
        echo "  VPC still in use by an undeleted subnet, retrying in ${RETRY_INTERVAL_SECONDS}s..."
      fi
    else
      # A failed listing call is NOT "no VPCs left" -- don't let a
      # transient API error short-circuit this into a false success.
      echo "  WARNING: 'ibmcloud is vpcs' failed to list resources, will retry."
    fi

    if (($(date +%s) >= deadline)); then
      return 1
    fi
    sleep "${RETRY_INTERVAL_SECONDS}"
  done
}

echo "=== Cleaning VPC resources for '${CLUSTER_NAME}' (dry_run=${DRY_RUN}, clean_vpc=${CLEAN_VPC}) ==="

echo "1. Deleting stale DNS records (must be first — installer refuses to start if records exist)..."
ibmcloud plugin install cis -f 2>&1 | tail -1 || true
CIS_ID=$(ibmcloud cis instances --output json 2>/dev/null | jq -r '.[0].crn // empty' || true)
if [[ -n "${CIS_ID}" ]]; then
  ibmcloud cis instance-set "${CIS_ID}" 2>&1 || true
  for zone_id in $(ibmcloud cis domains --output json 2>/dev/null | jq -r 'if type == "array" then .[].id else empty end' || true); do
    (ibmcloud cis dns-records "${zone_id}" --output json 2>/dev/null || echo '[]') \
      | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | contains($cn)) | .id else empty end' \
      | while read -r id; do echo "  Deleting DNS ${id}"; run_or_dry ibmcloud cis dns-record-delete "${zone_id}" "${id}"; done
  done
fi

echo "2. Deleting stale VMs..."
(ibmcloud is instances --output json 2>/dev/null || echo '[]') \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do echo "  Deleting VM ${id}"; run_or_dry ibmcloud is instance-delete "${id}" -f; done
[[ "${DRY_RUN}" != "true" ]] && sleep 60

echo "3. Collecting stale subnet IDs..."
STALE_SUBNET_IDS=$(ibmcloud is subnets --output json 2>/dev/null \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then [.[] | select(.name | startswith($cn)) | .id] else [] end | join("\n")' 2>/dev/null || true)
echo "  Found $(echo "${STALE_SUBNET_IDS}" | grep -c . 2>/dev/null || echo 0) stale subnet(s)"

echo "4. Deleting load balancers in stale subnets + by name..."
ALL_LBS=$(ibmcloud is lbs --output json 2>/dev/null || echo '[]')
if [[ -n "${STALE_SUBNET_IDS}" ]]; then
  SUBNET_FILTER=$(echo "${STALE_SUBNET_IDS}" | jq -R -s 'split("\n") | map(select(length > 0))')
  echo "${ALL_LBS}" \
    | jq -r --argjson sids "${SUBNET_FILTER}" \
      'if type == "array" then .[] | select([.subnets[]?.id] | any(. as $s | $sids | any(. == $s))) | .id else empty end' \
    | sort -u \
    | while read -r id; do echo "  Deleting LB ${id} (in stale subnet)"; run_or_dry ibmcloud is load-balancer-delete "${id}" -f; done
fi
# LBs from the cloud-provider-ibm controller are named kube-<cluster>-<hash>,
# not <cluster>-*, so a plain startswith($cn) alone would miss them.
echo "${ALL_LBS}" \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select((.name | startswith($cn)) or (.name | startswith("kube-" + $cn))) | .id else empty end' \
  | while read -r id; do echo "  Deleting LB ${id} (by name)"; run_or_dry ibmcloud is load-balancer-delete "${id}" -f; done
[[ "${DRY_RUN}" != "true" ]] && sleep 60

echo "5. Waiting for LB deletions to complete..."
if [[ "${DRY_RUN}" != "true" ]]; then
  for i in $(seq 1 24); do
    CURRENT_LBS=$(ibmcloud is lbs --output json 2>/dev/null || echo '[]')
    REMAINING=0
    if [[ -n "${STALE_SUBNET_IDS}" ]]; then
      SUBNET_FILTER=$(echo "${STALE_SUBNET_IDS}" | jq -R -s 'split("\n") | map(select(length > 0))')
      BY_SUBNET=$(echo "${CURRENT_LBS}" \
        | jq -r --argjson sids "${SUBNET_FILTER}" \
          'if type == "array" then [.[] | select([.subnets[]?.id] | any(. as $s | $sids | any(. == $s)))] | length else 0 end' 2>/dev/null || echo "0")
      REMAINING=$((REMAINING + BY_SUBNET))
    fi
    BY_NAME=$(echo "${CURRENT_LBS}" \
      | jq -r --arg cn "${CLUSTER_NAME}" \
        'if type == "array" then [.[] | select((.name | startswith($cn)) or (.name | startswith("kube-" + $cn)))] | length else 0 end' 2>/dev/null || echo "0")
    REMAINING=$((REMAINING > BY_NAME ? REMAINING : REMAINING + BY_NAME))
    if [[ "${REMAINING}" -eq 0 ]]; then
      echo "  All LBs deleted."
      break
    fi
    echo "  ${REMAINING} LB(s) still deleting... (${i}/24)"
    sleep 30
  done
fi

echo "6. Detaching public gateways from subnets..."
(ibmcloud is subnets --output json 2>/dev/null || echo '[]') \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | select(.public_gateway != null) | .id else empty end' \
  | while read -r id; do echo "  Detaching gateway from subnet ${id}"; run_or_dry ibmcloud is subnet-public-gateway-detach "${id}" -f; done
[[ "${DRY_RUN}" != "true" ]] && sleep 10

echo "7. Deleting stale subnets (first pass)..."
(ibmcloud is subnets --output json 2>/dev/null || echo '[]') \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do echo "  Deleting subnet ${id}"; run_or_dry ibmcloud is subnet-delete "${id}" -f; done
[[ "${DRY_RUN}" != "true" ]] && sleep 30

echo "8. Deleting stale public gateways..."
(ibmcloud is public-gateways --output json 2>/dev/null || echo '[]') \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do echo "  Deleting gateway ${id}"; run_or_dry ibmcloud is public-gateway-delete "${id}" -f; done

echo "9. Deleting stale floating IPs..."
(ibmcloud is ips --output json 2>/dev/null || echo '[]') \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do echo "  Releasing IP ${id}"; run_or_dry ibmcloud is floating-ip-release "${id}" -f; done

echo "10. Stripping security group rules (breaks circular references)..."
if [[ "${DRY_RUN}" == "true" ]]; then
  echo "  [dry-run] skipping rule strip"
else
  (ibmcloud is security-groups --output json 2>/dev/null || echo '[]') \
    | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
    | while read -r sg_id; do
        (ibmcloud is security-group-rules "${sg_id}" --output json 2>/dev/null || echo '[]') \
          | jq -r 'if type == "array" then .[] | .id else empty end' \
          | while read -r rule_id; do
              ibmcloud is security-group-rule-delete "${sg_id}" "${rule_id}" -f 2>&1 || true
            done
      done
fi

echo "11. Deleting stale security groups..."
if [[ "${DRY_RUN}" == "true" ]]; then
  (ibmcloud is security-groups --output json 2>/dev/null || echo '[]') \
    | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | "  [dry-run] would delete SG \(.id) (\(.name))" else empty end'
else
  for pass in 1 2 3; do
    REMAINING_SGS=$(ibmcloud is security-groups --output json 2>/dev/null \
      | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then [.[] | select(.name | startswith($cn))] | length else 0 end' 2>/dev/null || echo "0")
    if [[ "${REMAINING_SGS}" -eq 0 || -z "${REMAINING_SGS}" ]]; then
      break
    fi
    echo "  Pass ${pass}: ${REMAINING_SGS} security group(s) remaining..."
    (ibmcloud is security-groups --output json 2>/dev/null || echo '[]') \
      | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
      | while read -r id; do ibmcloud is security-group-delete "${id}" -f 2>&1 || true; done
    sleep 10
  done
fi

echo "12. Retrying stale subnets (polling up to ${RETRY_BUDGET_SECONDS}s for IKS worker nodes to drain)..."
SUBNETS_CLEARED="true"
if ! poll_delete_subnets; then
  SUBNETS_CLEARED="false"
  echo "  WARNING: subnet(s) matching '${CLUSTER_NAME}' still exist after ${RETRY_BUDGET_SECONDS}s of retries."
fi

VPCS_CLEARED="true"
if [[ "${CLEAN_VPC}" == "true" ]]; then
  echo "13. Deleting stale VPCs (polling up to ${RETRY_BUDGET_SECONDS}s while a lingering subnet is removed)..."
  if ! poll_delete_vpcs; then
    VPCS_CLEARED="false"
    echo "  WARNING: VPC(s) matching '${CLUSTER_NAME}' still exist after ${RETRY_BUDGET_SECONDS}s of retries."
  fi
else
  echo "13. Skipping VPC deletion (CLEAN_VPC=false)."
fi

echo "14. Deleting orphaned custom images (RHCOS)..."
(ibmcloud is images --visibility private --output json 2>/dev/null || echo '[]') \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do echo "  Deleting image ${id}"; run_or_dry ibmcloud is image-delete "${id}" -f; done

echo "15. Deleting orphaned COS instances..."
(ibmcloud resource service-instances --service-name cloud-object-storage --output json 2>/dev/null || echo '[]') \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do echo "  Deleting COS ${id}"; run_or_dry ibmcloud resource service-instance-delete "${id}" -f --recursive; done

echo "=== VPC resource cleanup complete ==="

# Surface leftovers as a failure (unless this was only a dry run) so
# callers that care -- teardown and cleanup-all -- don't report success
# while a subnet or VPC is still sitting in the account.
if [[ "${DRY_RUN}" != "true" ]]; then
  if [[ "${SUBNETS_CLEARED}" != "true" || ( "${CLEAN_VPC}" == "true" && "${VPCS_CLEARED}" != "true" ) ]]; then
    echo "::error::VPC resource cleanup for '${CLUSTER_NAME}' left a subnet or VPC behind -- see WARNINGs above."
    exit 1
  fi
fi
