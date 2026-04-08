#!/bin/bash
#
# Check the health of the hot cluster: API server, nodes, HCO, KubeVirt pods,
# ARC runner scale set, storage, and console route.
#
# Returns exit code 0 if all checks pass, non-zero otherwise.
#
# Optional environment variables:
#   ARC_RUNNERS_NS  - Namespace for ARC runner scale set (default: "arc-runners")

set -uo pipefail

ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
FAILURES=0

check() {
  local name="$1"
  shift
  echo -n "Checking ${name}... "
  if "$@"; then
    echo "✅ OK"
  else
    echo "❌ FAILED"
    FAILURES=$((FAILURES + 1))
  fi
}

echo "=== Cluster Health Check ==="
echo ""

# --- API Server ---
check "API server reachability" oc cluster-info

# --- Node readiness ---
check "node readiness" bash -c '
  ready_nodes=$(oc get nodes --no-headers 2>/dev/null | grep -c " Ready")
  if [[ "${ready_nodes}" -ge 1 ]]; then
    echo "  ${ready_nodes} node(s) Ready"
    exit 0
  else
    echo "  No nodes in Ready state"
    exit 1
  fi
'

# --- HCO Available ---
check "HCO Available condition" \
  oc wait -n kubevirt-hyperconverged hyperconverged kubevirt-hyperconverged \
    --for=condition=Available --timeout=60s

# --- Key KubeVirt pods ---
check "virt-api pods" bash -c '
  running=$(oc get pods -n kubevirt-hyperconverged -l kubevirt.io=virt-api --no-headers 2>/dev/null | grep -c "Running")
  [[ "${running}" -ge 1 ]]
'

check "virt-controller pods" bash -c '
  running=$(oc get pods -n kubevirt-hyperconverged -l kubevirt.io=virt-controller --no-headers 2>/dev/null | grep -c "Running")
  [[ "${running}" -ge 1 ]]
'

check "virt-handler pods" bash -c '
  running=$(oc get pods -n kubevirt-hyperconverged -l kubevirt.io=virt-handler --no-headers 2>/dev/null | grep -c "Running")
  [[ "${running}" -ge 1 ]]
'

# --- ARC runner scale set ---
# Scale sets scale to zero when idle; check the AutoscalingRunnerSet resource rather than
# counting ephemeral runner pods (which may be 0 between jobs).
check "ARC AutoscalingRunnerSet in ${ARC_RUNNERS_NS}" bash -c "
  if ! oc get namespace '${ARC_RUNNERS_NS}' &>/dev/null; then
    echo '  Namespace ${ARC_RUNNERS_NS} does not exist'
    exit 1
  fi
  rs_count=\$(oc get autoscalingrunnersets -n '${ARC_RUNNERS_NS}' --no-headers 2>/dev/null | wc -l)
  if [[ \"\${rs_count}\" -ge 1 ]]; then
    echo \"  \${rs_count} AutoscalingRunnerSet(s) found\"
    exit 0
  else
    echo '  No AutoscalingRunnerSets found in ${ARC_RUNNERS_NS}'
    exit 1
  fi
"

# --- ARC listener pod ---
# The listener pod stays Running even when the scale set is idle (no ephemeral runner pods).
# A missing or non-Running listener means the scale set cannot pick up jobs.
check "ARC listener pod in ${ARC_RUNNERS_NS}" bash -c "
  running=\$(oc get pods -n '${ARC_RUNNERS_NS}' --no-headers 2>/dev/null | grep -c 'Running')
  if [[ \"\${running}\" -ge 1 ]]; then
    echo \"  \${running} Running pod(s) (listener/controller)\"
    exit 0
  else
    echo '  No Running pods in ${ARC_RUNNERS_NS} — listener may be down'
    exit 1
  fi
"

# --- Default StorageClass ---
check "default StorageClass" bash -c '
  default_sc=$(oc get storageclass -o jsonpath="{.items[?(@.metadata.annotations.storageclass\.kubernetes\.io/is-default-class==\"true\")].metadata.name}" 2>/dev/null)
  if [[ -n "${default_sc}" ]]; then
    echo "  Default StorageClass: ${default_sc}"
    exit 0
  else
    echo "  No default StorageClass found"
    exit 1
  fi
'

# --- Console route ---
check "console route accessible" bash -c '
  console_url=$(oc get consoles.config.openshift.io cluster -o jsonpath="{.status.consoleURL}" 2>/dev/null)
  if [[ -n "${console_url}" ]]; then
    echo "  Console URL: ${console_url}"
    exit 0
  else
    echo "  Console URL not found"
    exit 1
  fi
'

echo ""
echo "=== Health Check Summary ==="
if [[ ${FAILURES} -eq 0 ]]; then
  echo "All checks passed"
  exit 0
else
  echo "${FAILURES} check(s) FAILED"
  exit 1
fi
