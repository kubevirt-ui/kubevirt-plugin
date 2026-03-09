#!/bin/bash
#
# Check the health of the hot cluster: API server, nodes, HCO, KubeVirt pods,
# ARC runners, storage, and console route.
#
# Returns exit code 0 if all checks pass, non-zero otherwise.
#
# Optional environment variables:
#   ARC_RUNNERS_NS         - Namespace for ARC runners (default: "arc-runners")
#   GITHUB_REPOSITORY      - owner/repo for GitHub API runner check (legacy runners only)
#   SKIP_ARC_GITHUB_CHECK  - Set to "true" to skip the GitHub API runner registration check
#
# Note: Runner scale sets (ARC) do not appear in GET /repos/.../actions/runners. When ARC
# runner pods exist in ARC_RUNNERS_NS, the script skips the GitHub API check.

set -uo pipefail

ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
SKIP_ARC_GITHUB_CHECK="${SKIP_ARC_GITHUB_CHECK:-false}"
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

# --- ARC runner pods ---
check "ARC runner pods in ${ARC_RUNNERS_NS}" bash -c "
  if oc get namespace ${ARC_RUNNERS_NS} &>/dev/null; then
    pod_count=\$(oc get pods -n ${ARC_RUNNERS_NS} --no-headers 2>/dev/null | wc -l)
    echo \"  \${pod_count} pod(s) found\"
    exit 0
  else
    echo \"  Namespace ${ARC_RUNNERS_NS} does not exist\"
    exit 1
  fi
"

# --- Verify runners registered (scale set or legacy) ---
# Runner scale sets (ARC) do not appear in GET /repos/.../actions/runners. If we have
# ARC pods in the cluster, we treat that as "runners available". Otherwise we check the
# legacy API for online runners with label "kubevirt-plugin-ci".
HAS_ARC_PODS=0
if oc get namespace "${ARC_RUNNERS_NS}" &>/dev/null; then
  pod_count=$(oc get pods -n "${ARC_RUNNERS_NS}" --no-headers 2>/dev/null | wc -l)
  [[ "${pod_count}" -ge 1 ]] && HAS_ARC_PODS=1
fi

if [[ "${SKIP_ARC_GITHUB_CHECK}" == "true" ]]; then
  echo "Skipping runner registration check (SKIP_ARC_GITHUB_CHECK=true)"
elif [[ "${HAS_ARC_PODS}" -eq 1 ]]; then
  echo "Checking for runners (scale set or legacy)... ARC runner scale set present; no need to check legacy API."
  echo "Runner check passed (scale set)."
elif [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
  check "runners registered (scale set or legacy)" bash -c '
    echo "Checking for runners (scale set or legacy)..."
    # No ARC pods: fall back to legacy self-hosted runners API (online + kubevirt-plugin-ci label).
    online_count=$(gh api "/repos/'"${GITHUB_REPOSITORY}"'/actions/runners" \
      --jq "[.runners[] | select(.status == \"online\") | select(.labels[].name == \"kubevirt-plugin-ci\")] | length" 2>/dev/null || echo "0")
    if [[ "${online_count}" -ge 1 ]]; then
      echo "  ${online_count} online runner(s) with label kubevirt-plugin-ci"
      exit 0
    else
      echo "::error::No runners found: no ARC pods in '"${ARC_RUNNERS_NS}"' and no online legacy runners with label kubevirt-plugin-ci."
      echo "  The Run Gating Tests job uses runs-on: kubevirt-plugin-ci. Ensure ARC is installed and the scale set is registered."
      exit 1
    fi
  '
else
  echo "Skipping runner registration check (no GITHUB_REPOSITORY)"
fi

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
