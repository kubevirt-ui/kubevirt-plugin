#!/usr/bin/env bash
set -euo pipefail

# Single source of truth for "delete every IBM Cloud VPC-infrastructure
# resource whose name starts with CLUSTER_NAME". Infra-type-agnostic --
# shared by ibmc-cluster-setup.yml, create-ipi-cluster.sh's retry loop,
# ibmc-cluster-teardown.yml, and ibmc-cleanup-all.yml.
#
# Required env: CLUSTER_NAME, IC_API_KEY
# Optional env:
#   ZONE       - if set, re-targets the CLI to this zone's region first.
#   DRY_RUN    - "true" to only list matching resources (default: "false").
#   CLEAN_VPC  - "false" to skip deleting the VPC itself, while still
#                cleaning everything inside it (default: "true").

export IC_API_KEY
DRY_RUN="${DRY_RUN:-false}"
CLEAN_VPC="${CLEAN_VPC:-true}"

if [[ -n "${ZONE:-}" ]]; then
  VPC_REGION="${ZONE%-*}"
  ibmcloud target -r "${VPC_REGION}" 2>/dev/null || true
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

echo "7. Deleting stale subnets..."
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

echo "12. Retrying stale subnets (after LBs fully removed)..."
(ibmcloud is subnets --output json 2>/dev/null || echo '[]') \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do run_or_dry ibmcloud is subnet-delete "${id}" -f; done
[[ "${DRY_RUN}" != "true" ]] && sleep 10

if [[ "${CLEAN_VPC}" == "true" ]]; then
  echo "13. Deleting stale VPCs..."
  (ibmcloud is vpcs --output json 2>/dev/null || echo '[]') \
    | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
    | while read -r id; do echo "  Deleting VPC ${id}"; run_or_dry ibmcloud is vpc-delete "${id}" -f; done
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
