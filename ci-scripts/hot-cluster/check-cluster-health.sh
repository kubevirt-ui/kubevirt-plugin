#!/bin/bash
#
# Check the health of the hot cluster: API server, nodes, HCO, KubeVirt pods,
# ARC runner scale set, image registry, public gateway (vpc), storage, and
# console route.
#
# Returns exit code 0 if all checks pass, non-zero otherwise.
#
# Optional environment variables:
#   ARC_RUNNERS_NS         - Namespace for ARC runner scale set (default: "arc-runners")
#   ARC_CONTROLLER_NS      - Namespace for ARC controller + listener (default: "arc-systems")
#   RUNNER_SCALE_SET_NAME  - Scale set to check the listener for (default: "kubevirt-plugin-ci")
#   VPC_NAME, ZONE         - If both set, also verifies the cluster's VPC
#                            subnet ("${VPC_NAME}-subnet-${ZONE}") has a
#                            public gateway attached. Requires the
#                            vpc-infrastructure ibmcloud CLI plugin and an
#                            already-targeted region. Skipped (not
#                            failed) if either is unset.

set -uo pipefail

ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
ARC_CONTROLLER_NS="${ARC_CONTROLLER_NS:-arc-systems}"
RUNNER_SCALE_SET_NAME="${RUNNER_SCALE_SET_NAME:-kubevirt-plugin-ci}"
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
  oc wait -n openshift-cnv hyperconverged kubevirt-hyperconverged \
    --for=condition=Available --timeout=60s

# --- Key KubeVirt pods ---
check "virt-api pods" bash -c '
  running=$(oc get pods -n openshift-cnv -l kubevirt.io=virt-api --no-headers 2>/dev/null | grep -c "Running")
  [[ "${running}" -ge 1 ]]
'

check "virt-controller pods" bash -c '
  running=$(oc get pods -n openshift-cnv -l kubevirt.io=virt-controller --no-headers 2>/dev/null | grep -c "Running")
  [[ "${running}" -ge 1 ]]
'

check "virt-handler pods" bash -c '
  running=$(oc get pods -n openshift-cnv -l kubevirt.io=virt-handler --no-headers 2>/dev/null | grep -c "Running")
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

# --- ARC controller pod ---
check "ARC controller pod in ${ARC_CONTROLLER_NS}" bash -c "
  running=\$(oc get pods -n '${ARC_CONTROLLER_NS}' -l app.kubernetes.io/name=gha-rs-controller --no-headers 2>/dev/null | grep -c 'Running' || true)
  [[ \"\${running}\" -ge 1 ]]
"

# --- ARC listener pod for this specific scale set ---
# The controller always creates each scale set's AutoscalingListener object
# -- and its Pod -- in *its own* namespace (ARC_CONTROLLER_NS), never in
# the runner scale set's own namespace (ARC_RUNNERS_NS). Confirmed against
# upstream source (autoscalinglistener_controller.go). A generic "N pods
# Running" count in ARC_CONTROLLER_NS is a false positive: it can pass on
# controller-only pods with no listener at all, and never confirms the
# listener actually belongs to this scale set. Look up this scale set's
# own AutoscalingListener object by name instead, then verify its pod is
# Running with every container Ready. A missing/unready listener means
# this scale set cannot pick up jobs -- this is a hard failure, same as
# every other check in this script.
check "ARC listener pod for '${RUNNER_SCALE_SET_NAME}' in ${ARC_CONTROLLER_NS}" bash -c "
  for attempt in 1 2 3 4 5 6; do
    listener_name=\$(oc get autoscalinglisteners -n '${ARC_CONTROLLER_NS}' -o json 2>/dev/null \\
      | jq -r --arg name '${RUNNER_SCALE_SET_NAME}' --arg ns '${ARC_RUNNERS_NS}' \\
        '.items[] | select(.spec.autoscalingRunnerSetName == \$name and .spec.autoscalingRunnerSetNamespace == \$ns) | .metadata.name' \\
      | head -n1)
    if [[ -n \"\${listener_name}\" ]]; then
      phase=\$(oc get pod \"\${listener_name}\" -n '${ARC_CONTROLLER_NS}' -o jsonpath='{.status.phase}' 2>/dev/null || true)
      ready=\$(oc get pod \"\${listener_name}\" -n '${ARC_CONTROLLER_NS}' -o jsonpath='{.status.containerStatuses[*].ready}' 2>/dev/null || true)
      if [[ \"\${phase}\" == 'Running' && -n \"\${ready}\" && \"\${ready}\" != *'false'* ]]; then
        echo \"  Listener pod '\${listener_name}' is Running and Ready\"
        exit 0
      fi
    fi
    if [[ \"\${attempt}\" -lt 6 ]]; then
      sleep 30
    fi
  done
  echo \"  No Ready AutoscalingListener pod found for scale set '${RUNNER_SCALE_SET_NAME}' in ${ARC_CONTROLLER_NS}:\"
  oc get autoscalinglisteners -n '${ARC_CONTROLLER_NS}' 2>/dev/null || echo '  (no AutoscalingListener objects found)'
  exit 1
"

# --- Image registry ---
# Catches a broken/unreconciled internal registry (e.g. a missing or
# InvalidAccessKeyId COS backing store) at health-check time, with a clear
# diagnostic -- instead of discovering it an hour later as a silent
# ImagePullBackOff on ARC runner pods, or a 15-minute "Watch for ARC
# runner pickup" timeout with no indication of the real cause.
check "image-registry ClusterOperator Available" bash -c '
  available=$(oc get co image-registry -o jsonpath="{.status.conditions[?(@.type==\"Available\")].status}" 2>/dev/null)
  if [[ "${available}" == "True" ]]; then
    exit 0
  else
    echo "  image-registry Available condition: ${available:-unknown}"
    oc get co image-registry 2>&1 | tail -5
    exit 1
  fi
'

# --- Public gateway / egress (VPC only) ---
# A subnet without a public gateway gives every pod zero outbound
# internet access -- the ARC listener can't reach GitHub, runner pods
# can't register, and the only visible symptom is a 15-minute "Watch for
# ARC runner pickup" timeout with no online runners. VPC_NAME/ZONE are
# optional: this check is a no-op for infra types where it doesn't apply
# or when the caller hasn't wired them through.
if [[ -n "${VPC_NAME:-}" && -n "${ZONE:-}" ]]; then
  export VPC_NAME ZONE
  # Single-quoted body + exported env vars, not string interpolation: ZONE
  # is an unvalidated free-text workflow input, so baking it directly into
  # the command string would let shell metacharacters in it affect this
  # subshell's parsing.
  check "public gateway attached to VPC subnet" bash -c '
    vpc_region="${ZONE%-*}"
    if ! ibmcloud target -r "${vpc_region}" >/dev/null 2>&1; then
      echo "  Failed to target region \"${vpc_region}\" (derived from ZONE=\"${ZONE}\") -- cannot verify public gateway"
      exit 1
    fi
    subnet_name="${VPC_NAME}-subnet-${ZONE}"
    if ! subnets_json=$(ibmcloud is subnets --output json 2>&1); then
      echo "  Failed to list subnets in region \"${vpc_region}\" -- cannot distinguish this from a genuine missing gateway: ${subnets_json}"
      exit 1
    fi
    pgw_id=$(echo "${subnets_json}" | jq -r --arg n "${subnet_name}" ".[] | select(.name == \$n) | .public_gateway.id // empty")
    if [[ -n "${pgw_id}" ]]; then
      echo "  Subnet \"${subnet_name}\" has public gateway ${pgw_id} attached"
      exit 0
    else
      echo "  Subnet \"${subnet_name}\" has NO public gateway attached -- pods have no outbound internet access"
      exit 1
    fi
  '
else
  echo "Skipping public gateway check (VPC_NAME/ZONE not set)"
  echo ""
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
