#!/usr/bin/env bash
#
# Wait for the ARC AutoscalingListener pod for RUNNER_SCALE_SET_NAME to become
# Ready. Dumps describe/events on failure and attempts one listener pod bounce
# before giving up. Used after Install ARC / when healing an unready listener
# so Verify cluster health does not fail a usable cluster prematurely.
#
# Env:
#   RUNNER_SCALE_SET_NAME  - scale set name (required)
#   ARC_CONTROLLER_NS      - default arc-systems
#   ARC_RUNNERS_NS         - default arc-runners
#   LISTENER_WAIT_ATTEMPTS - default 24 (30s each ≈ 12m)
#
set -euo pipefail

RUNNER_SCALE_SET_NAME="${RUNNER_SCALE_SET_NAME:?RUNNER_SCALE_SET_NAME is required}"
ARC_CONTROLLER_NS="${ARC_CONTROLLER_NS:-arc-systems}"
ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
LISTENER_WAIT_ATTEMPTS="${LISTENER_WAIT_ATTEMPTS:-24}"

# Resolves the AutoscalingListener object name for this scale set, or empty.
# Never fails under set -e: oc/jq errors become an empty result.
find_listener_name() {
  local name=""
  name="$(oc get autoscalinglisteners -n "${ARC_CONTROLLER_NS}" -o json 2>/dev/null \
    | jq -r --arg name "${RUNNER_SCALE_SET_NAME}" --arg ns "${ARC_RUNNERS_NS}" \
      '.items[] | select(.spec.autoscalingRunnerSetName == $name and .spec.autoscalingRunnerSetNamespace == $ns) | .metadata.name' \
    2>/dev/null \
    | head -n1)" || true
  echo "${name}"
}

listener_ready() {
  local listener_name phase ready
  listener_name="$(find_listener_name)"
  if [[ -z "${listener_name}" ]]; then
    return 1
  fi
  phase="$(oc get pod "${listener_name}" -n "${ARC_CONTROLLER_NS}" -o jsonpath='{.status.phase}' 2>/dev/null || true)"
  ready="$(oc get pod "${listener_name}" -n "${ARC_CONTROLLER_NS}" -o jsonpath='{.status.containerStatuses[*].ready}' 2>/dev/null || true)"
  if [[ "${phase}" == 'Running' && -n "${ready}" && "${ready}" != *'false'* ]]; then
    echo "Listener pod '${listener_name}' is Running and Ready"
    return 0
  fi
  echo "Listener '${listener_name:-<none>}' phase=${phase:-unknown} ready=${ready:-unknown}"
  return 1
}

dump_listener_diagnostics() {
  echo "=== ARC listener diagnostics ==="
  oc get autoscalinglisteners -n "${ARC_CONTROLLER_NS}" -o wide 2>/dev/null || echo "(no AutoscalingListener objects)"
  oc get pods -n "${ARC_CONTROLLER_NS}" -o wide 2>/dev/null || true
  local listener_name
  listener_name="$(find_listener_name)"
  if [[ -n "${listener_name}" ]]; then
    echo "--- oc describe pod ${listener_name} ---"
    oc describe pod "${listener_name}" -n "${ARC_CONTROLLER_NS}" 2>/dev/null || true
  fi
  echo "--- recent events (${ARC_CONTROLLER_NS}) ---"
  oc get events -n "${ARC_CONTROLLER_NS}" --sort-by='.lastTimestamp' 2>/dev/null | tail -40 || true
}

bounce_listener() {
  local listener_name
  listener_name="$(find_listener_name)"
  if [[ -z "${listener_name}" ]]; then
    echo "No AutoscalingListener to bounce for '${RUNNER_SCALE_SET_NAME}'"
    return 0
  fi
  echo "Bouncing listener pod '${listener_name}' to force a fresh registration..."
  oc delete pod "${listener_name}" -n "${ARC_CONTROLLER_NS}" --wait=false 2>/dev/null || true
}

echo "=== Waiting for ARC listener Ready (${RUNNER_SCALE_SET_NAME}) ==="
for attempt in $(seq 1 "${LISTENER_WAIT_ATTEMPTS}"); do
  if listener_ready; then
    exit 0
  fi
  echo "Waiting for listener Ready... (${attempt}/${LISTENER_WAIT_ATTEMPTS})"
  sleep 30
done

echo "Listener not Ready after first wait window -- dumping diagnostics and bouncing once..."
dump_listener_diagnostics
bounce_listener

for attempt in $(seq 1 12); do
  if listener_ready; then
    exit 0
  fi
  echo "Waiting after bounce... (${attempt}/12)"
  sleep 30
done

dump_listener_diagnostics
echo "ERROR: ARC listener for '${RUNNER_SCALE_SET_NAME}' did not become Ready"
exit 1
