#!/bin/bash
set -euo pipefail

# Polls IBM Cloud until the ROKS cluster is fully available.
# The cluster is ready when:
#   .state is "normal" AND (.ingress.status is "healthy" OR .ingress.hostname is non-empty)
#
# IBM Cloud's ingress.status can remain "critical" due to stale monitoring even when
# the actual OpenShift Ingress Operator is healthy (Available=True, Degraded=False).
# A non-empty ingress.hostname means DNS + TLS are provisioned and the cluster is
# functional, so we accept that as a readiness signal.
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
echo "  Ready when: state=normal AND (ingress.status=healthy OR ingress.hostname is assigned)"
echo "  Timeout: ${MAX_WAIT}s, poll interval: ${INTERVAL}s"
echo ""

ELAPSED=0

while [[ ${ELAPSED} -lt ${MAX_WAIT} ]]; do
  CLUSTER_JSON=$(ibmcloud oc cluster get --cluster "${CLUSTER_NAME}" --output json 2>/dev/null || echo "{}")

  STATE=$(echo "${CLUSTER_JSON}" | jq -r '.state // "unknown"')
  MASTER_STATUS=$(echo "${CLUSTER_JSON}" | jq -r '.lifecycle.masterStatus // "unknown"')
  MASTER_HEALTH=$(echo "${CLUSTER_JSON}" | jq -r '.lifecycle.masterHealth // "unknown"')
  INGRESS_STATUS=$(echo "${CLUSTER_JSON}" | jq -r '.ingress.status // "unknown"')
  INGRESS_HOSTNAME=$(echo "${CLUSTER_JSON}" | jq -r '.ingress.hostname // ""')
  WORKER_STATUS=$(echo "${CLUSTER_JSON}" | jq -r '.status // "unknown"')
  WORKER_COUNT=$(echo "${CLUSTER_JSON}" | jq -r '.workerCount // 0')

  echo "[$(date '+%H:%M:%S')] state=${STATE}  master=${MASTER_STATUS}/${MASTER_HEALTH}  ingress=${INGRESS_STATUS}  hostname=${INGRESS_HOSTNAME:-<empty>}  workers=${WORKER_COUNT} \"${WORKER_STATUS}\"  (${ELAPSED}s elapsed)"

  if [[ "${STATE}" == "critical" || "${STATE}" == "delete_failed" ]]; then
    echo "ERROR: Cluster entered '${STATE}' state"
    exit 1
  fi

  if [[ "${STATE}" == "normal" && "${INGRESS_STATUS}" == "healthy" ]]; then
    echo ""
    echo "Cluster is fully available!"
    exit 0
  fi

  if [[ "${STATE}" == "normal" && -n "${INGRESS_HOSTNAME}" ]]; then
    echo ""
    echo "Cluster is ready (ingress hostname assigned; IBM Cloud status reporting may be stale)."
    exit 0
  fi

  sleep ${INTERVAL}
  ELAPSED=$((ELAPSED + INTERVAL))
done

echo "ERROR: Cluster did not become fully available within ${MAX_WAIT}s"
echo ""
echo "Final cluster state:"
echo "${CLUSTER_JSON}" | jq '{state, status, ingress, lifecycle}' 2>/dev/null || true
exit 1
