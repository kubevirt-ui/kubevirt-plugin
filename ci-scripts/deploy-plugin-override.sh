#!/bin/bash
#
# Override the CNV-bundled kubevirt console plugin deployment with a custom image.
#
# This script:
#   1. Discovers the console plugin deployment managed by SSP/HCO
#   2. Scales down ssp-operator to prevent reconciliation reverting the change
#   3. Patches the deployment with the specified plugin image
#   4. Waits for the rollout to complete
#
# Environment variables:
#   PLUGIN_IMAGE   (required) The container image to deploy
#   CNV_NS         Namespace where CNV lives (default: openshift-cnv)
#
set -euo pipefail

PLUGIN_IMAGE="${PLUGIN_IMAGE:?PLUGIN_IMAGE is required}"
CNV_NS="${CNV_NS:-openshift-cnv}"

echo "=== Deploy kubevirt-plugin override ==="
echo "  PLUGIN_IMAGE: ${PLUGIN_IMAGE}"
echo "  CNV_NS:       ${CNV_NS}"
echo ""

# --- Discover the console plugin deployment ---
echo "Discovering console plugin deployment in ${CNV_NS}..."

PLUGIN_DEPLOY=""
for name in kubevirt-console-plugin console-kubevirt-plugin kubevirt-plugin; do
  if oc get deployment "${name}" -n "${CNV_NS}" &>/dev/null; then
    PLUGIN_DEPLOY="${name}"
    break
  fi
done

if [[ -z "${PLUGIN_DEPLOY}" ]]; then
  echo "Could not find plugin deployment by known names, searching via ConsolePlugin CR..."
  CONSOLEPLUGIN_JSON=$(oc get consoleplugin -o json 2>/dev/null || echo '{"items":[]}')
  PLUGIN_DEPLOY=$(echo "${CONSOLEPLUGIN_JSON}" \
    | jq -r '.items[] | select(.metadata.name | test("kubevirt")) | .spec.backend.service.name // empty' \
    | head -1)

  if [[ -n "${PLUGIN_DEPLOY}" ]]; then
    SVC_NS=$(echo "${CONSOLEPLUGIN_JSON}" \
      | jq -r ".items[] | select(.spec.backend.service.name == \"${PLUGIN_DEPLOY}\") | .spec.backend.service.namespace // empty" \
      | head -1)
    if [[ -n "${SVC_NS}" && "${SVC_NS}" != "${CNV_NS}" ]]; then
      CNV_NS="${SVC_NS}"
      echo "  Plugin service namespace: ${CNV_NS}"
    fi

    PLUGIN_DEPLOY=$(oc get deployment -n "${CNV_NS}" -o name 2>/dev/null \
      | grep -i kubevirt | grep -i plugin | head -1 | sed 's|deployment.apps/||' || true)
  fi
fi

if [[ -z "${PLUGIN_DEPLOY}" ]]; then
  echo "ERROR: Could not discover the kubevirt console plugin deployment."
  echo "Available deployments in ${CNV_NS}:"
  oc get deployments -n "${CNV_NS}" --no-headers 2>/dev/null || true
  exit 1
fi

echo "  Found plugin deployment: ${PLUGIN_DEPLOY}"

# --- Pause reconciliation to prevent operators reverting the change ---
echo ""
echo "Pausing operator reconciliation..."

HCO_NAME=$(oc get hyperconverged -n "${CNV_NS}" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
if [[ -n "${HCO_NAME}" ]]; then
  oc annotate hyperconverged "${HCO_NAME}" -n "${CNV_NS}" \
    hco.kubevirt.io/paused="true" --overwrite
  echo "  Paused HCO reconciliation (hco.kubevirt.io/paused=true)"
else
  echo "  WARNING: HyperConverged CR not found, skipping HCO pause"
fi

SSP_DEPLOY=$(oc get deployment -n "${CNV_NS}" -o name 2>/dev/null \
  | grep ssp-operator | head -1 | sed 's|deployment.apps/||' || true)

if [[ -n "${SSP_DEPLOY}" ]]; then
  oc scale deployment "${SSP_DEPLOY}" -n "${CNV_NS}" --replicas=0
  echo "  Scaled ${SSP_DEPLOY} to 0 replicas"
else
  echo "  WARNING: ssp-operator deployment not found, skipping scale-down"
fi

# --- Patch the plugin deployment ---
echo ""
echo "Patching deployment ${PLUGIN_DEPLOY} with image ${PLUGIN_IMAGE}..."
CONTAINER_NAME=$(oc get deployment "${PLUGIN_DEPLOY}" -n "${CNV_NS}" \
  -o jsonpath='{.spec.template.spec.containers[0].name}')

oc set image "deployment/${PLUGIN_DEPLOY}" \
  -n "${CNV_NS}" \
  "${CONTAINER_NAME}=${PLUGIN_IMAGE}"

# --- Wait for rollout ---
echo "Waiting for rollout to complete..."
if oc rollout status "deployment/${PLUGIN_DEPLOY}" -n "${CNV_NS}" --timeout=5m; then
  echo ""
  echo "=== Plugin override deployed successfully ==="
  echo "  Deployment: ${PLUGIN_DEPLOY}"
  echo "  Image:      ${PLUGIN_IMAGE}"
  echo "  Namespace:  ${CNV_NS}"
else
  echo ""
  echo "WARNING: Rollout did not complete within 5 minutes."
  echo "  Check pod status:"
  POD_SELECTOR=$(oc get deployment "${PLUGIN_DEPLOY}" -n "${CNV_NS}" \
    -o jsonpath='{.spec.selector.matchLabels}' 2>/dev/null \
    | jq -r 'to_entries | map("\(.key)=\(.value)") | join(",")' 2>/dev/null || true)
  if [[ -n "${POD_SELECTOR}" ]]; then
    oc get pods -n "${CNV_NS}" -l "${POD_SELECTOR}" --no-headers 2>/dev/null || true
  else
    oc get pods -n "${CNV_NS}" 2>/dev/null | grep -i "${PLUGIN_DEPLOY}" || true
  fi
  exit 1
fi
