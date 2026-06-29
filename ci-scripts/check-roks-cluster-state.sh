#!/bin/bash
set -euo pipefail

# Polls IBM Cloud until the ROKS cluster is fully available.
# The cluster is ready when .state is "normal" AND .ingressStatus is "healthy".
#
# Required env:
#   CLUSTER_NAME   - name of the cluster to check
#
# Optional env:
#   MAX_WAIT       - timeout in seconds (default: 7200 = 2 hours)
#   INTERVAL       - poll interval in seconds (default: 60)

CLUSTER_NAME="${CLUSTER_NAME:?CLUSTER_NAME must be set}"
MAX_WAIT="${MAX_WAIT:-7200}"
INTERVAL="${INTERVAL:-60}"

echo "Waiting for cluster '${CLUSTER_NAME}' to be fully available..."
echo "  Ready when: state=normal, ingressStatus=healthy"
echo "  Timeout: ${MAX_WAIT}s, poll interval: ${INTERVAL}s"
echo ""

ELAPSED=0

while [[ ${ELAPSED} -lt ${MAX_WAIT} ]]; do
  CLUSTER_JSON=$(ibmcloud oc cluster get --cluster "${CLUSTER_NAME}" --output json 2>/dev/null || echo "{}")

  STATE=$(echo "${CLUSTER_JSON}" | jq -r '.state // "unknown"')
  MASTER_STATE=$(echo "${CLUSTER_JSON}" | jq -r '.masterState // "unknown"')
  INGRESS_STATUS=$(echo "${CLUSTER_JSON}" | jq -r '.ingressStatus // "unknown"')

  echo "[$(date '+%H:%M:%S')] state=${STATE}  masterState=${MASTER_STATE}  ingressStatus=${INGRESS_STATUS}  (${ELAPSED}s elapsed)"

  if [[ "${STATE}" == "critical" || "${STATE}" == "delete_failed" ]]; then
    echo "ERROR: Cluster entered '${STATE}' state"
    exit 1
  fi

  if [[ "${STATE}" == "normal" && "${INGRESS_STATUS}" == "healthy" ]]; then
    echo ""
    echo "Cluster is fully available!"
    exit 0
  fi

  sleep ${INTERVAL}
  ELAPSED=$((ELAPSED + INTERVAL))
done

echo "ERROR: Cluster did not become fully available within ${MAX_WAIT}s"
exit 1
