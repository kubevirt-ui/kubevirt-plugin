#!/usr/bin/env bash
set -euo pipefail

export IC_API_KEY
VPC_REGION="${ZONE%-*}"
ibmcloud target -r "${VPC_REGION}" 2>/dev/null || true

echo "=== Cleaning stale IPI resources for '${CLUSTER_NAME}' ==="

echo "1. Deleting stale DNS records (must be first — installer refuses to start if records exist)..."
ibmcloud plugin install cis -f 2>&1 | tail -1 || true
CIS_ID=$(ibmcloud cis instances --output json 2>/dev/null | jq -r '.[0].crn // empty' || true)
if [[ -n "${CIS_ID}" ]]; then
  ibmcloud cis instance-set "${CIS_ID}" 2>&1 || true
  for zone_id in $(ibmcloud cis domains --output json 2>/dev/null | jq -r '.[].id' || true); do
    ibmcloud cis dns-records "${zone_id}" --output json 2>/dev/null \
      | jq -r --arg cn "${CLUSTER_NAME}" '.[] | select(.name | contains($cn)) | .id' \
      | while read -r id; do echo "  Deleting DNS ${id}"; ibmcloud cis dns-record-delete "${zone_id}" "${id}" 2>&1 || echo "  WARNING: failed to delete DNS ${id}"; done
  done
fi

echo "2. Deleting stale VMs..."
ibmcloud is instances --output json 2>/dev/null \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do echo "  Deleting VM ${id}"; ibmcloud is instance-delete "${id}" -f 2>&1 || echo "  WARNING: failed to delete VM ${id}"; done
sleep 60

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
    | while read -r id; do echo "  Deleting LB ${id} (in stale subnet)"; ibmcloud is load-balancer-delete "${id}" -f 2>&1 || echo "  WARNING: failed to delete LB ${id}"; done
fi
echo "${ALL_LBS}" \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn) or (.name | startswith("kube-" + $cn))) | .id else empty end' \
  | while read -r id; do echo "  Deleting LB ${id} (by name)"; ibmcloud is load-balancer-delete "${id}" -f 2>&1 || echo "  WARNING: failed to delete LB ${id}"; done
sleep 60

echo "5. Waiting for LB deletions to complete..."
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
      'if type == "array" then [.[] | select(.name | startswith($cn) or (.name | startswith("kube-" + $cn)))] | length else 0 end' 2>/dev/null || echo "0")
  REMAINING=$((REMAINING > BY_NAME ? REMAINING : REMAINING + BY_NAME))
  if [[ "${REMAINING}" -eq 0 ]]; then
    echo "  All LBs deleted."
    break
  fi
  echo "  ${REMAINING} LB(s) still deleting... (${i}/24)"
  sleep 30
done

echo "6. Detaching public gateways from subnets..."
ibmcloud is subnets --output json 2>/dev/null \
  | jq -r --arg cn "${CLUSTER_NAME}" '.[] | select(.name | startswith($cn)) | select(.public_gateway != null) | .id' \
  | while read -r id; do echo "  Detaching gateway from subnet ${id}"; ibmcloud is subnet-public-gateway-detach "${id}" -f 2>&1 || echo "  WARNING: failed to detach gateway from subnet ${id}"; done
sleep 10

echo "7. Deleting stale subnets..."
ibmcloud is subnets --output json 2>/dev/null \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do echo "  Deleting subnet ${id}"; ibmcloud is subnet-delete "${id}" -f 2>&1 || echo "  WARNING: failed to delete subnet ${id}"; done
sleep 30

echo "8. Deleting stale public gateways..."
ibmcloud is public-gateways --output json 2>/dev/null \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do echo "  Deleting gateway ${id}"; ibmcloud is public-gateway-delete "${id}" -f 2>&1 || echo "  WARNING: failed to delete gateway ${id}"; done

echo "9. Deleting stale floating IPs..."
ibmcloud is ips --output json 2>/dev/null \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do echo "  Releasing IP ${id}"; ibmcloud is floating-ip-release "${id}" -f 2>&1 || echo "  WARNING: failed to release IP ${id}"; done

echo "10. Stripping security group rules (breaks circular references)..."
ibmcloud is security-groups --output json 2>/dev/null \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r sg_id; do
      ibmcloud is security-group-rules "${sg_id}" --output json 2>/dev/null \
        | jq -r '.[] | .id' \
        | while read -r rule_id; do
            ibmcloud is security-group-rule-delete "${sg_id}" "${rule_id}" -f 2>&1 || true
          done
    done

echo "11. Deleting stale security groups..."
for pass in 1 2 3; do
  REMAINING_SGS=$(ibmcloud is security-groups --output json 2>/dev/null \
    | jq -r --arg cn "${CLUSTER_NAME}" '[.[] | select(.name | startswith($cn))] | length' 2>/dev/null || echo "0")
  if [[ "${REMAINING_SGS}" -eq 0 || -z "${REMAINING_SGS}" ]]; then
    break
  fi
  echo "  Pass ${pass}: ${REMAINING_SGS} security group(s) remaining..."
  ibmcloud is security-groups --output json 2>/dev/null \
    | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
    | while read -r id; do ibmcloud is security-group-delete "${id}" -f 2>&1 || true; done
  sleep 10
done

echo "12. Retrying stale subnets (after LBs fully removed)..."
ibmcloud is subnets --output json 2>/dev/null \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do ibmcloud is subnet-delete "${id}" -f 2>&1 || echo "  WARNING: subnet ${id} still in use"; done
sleep 10

echo "13. Deleting stale VPCs..."
ibmcloud is vpcs --output json 2>/dev/null \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do echo "  Deleting VPC ${id}"; ibmcloud is vpc-delete "${id}" -f 2>&1 || echo "  WARNING: failed to delete VPC ${id}"; done

echo "14. Deleting orphaned custom images (RHCOS)..."
ibmcloud is images --visibility private --output json 2>/dev/null \
  | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
  | while read -r id; do echo "  Deleting image ${id}"; ibmcloud is image-delete "${id}" -f 2>&1 || echo "  WARNING: failed to delete image ${id}"; done

echo "15. Deleting orphaned COS instances..."
ibmcloud resource service-instances --service-name cloud-object-storage --output json 2>/dev/null \
  | jq -r --arg cn "${CLUSTER_NAME}" '.[] | select(.name | startswith($cn)) | .id' \
  | while read -r id; do echo "  Deleting COS ${id}"; ibmcloud resource service-instance-delete "${id}" -f --recursive 2>&1 || echo "  WARNING: failed to delete COS ${id}"; done

echo "=== Stale resource cleanup complete ==="
