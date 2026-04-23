#!/bin/bash
#
# Install the CI Environment Controller on an OpenShift cluster.
# This is a standalone script -- it does NOT depend on the ARC install.
#
# What it does:
#   1. Optionally builds the controller image via setup-ci-env-runner-image.sh
#   2. Runs helm upgrade --install with the ci-env-controller chart
#
# Optional environment variables:
#   CI_ENV_NS                    Namespace for the controller (default: ci-env)
#   CI_ENV_CONTROLLER_IMAGE      Pre-built image; skips image build if set
#   ARC_RUNNERS_NS               Namespace where ARC runner pods run (default: arc-runners)
#   RUNNER_SCALE_SET_NAME        ARC scale set name (default: kubevirt-plugin-ci)
#
# Prerequisites: oc login to OpenShift with cluster-admin, helm available

set -euo pipefail

CI_ENV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_SCRIPTS_DIR="$(cd "${CI_ENV_DIR}/.." && pwd)"
CHART_DIR="${CI_SCRIPTS_DIR}/helm/ci-env-controller"

CI_ENV_NS="${CI_ENV_NS:-ci-env}"
ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
RUNNER_SCALE_SET_NAME="${RUNNER_SCALE_SET_NAME:-kubevirt-plugin-ci}"
RUNNER_SA_NAME="${RUNNER_SCALE_SET_NAME}-gha-rs-no-permission"

echo "=== CI Environment Controller installation ==="
echo "  CI_ENV_NS:           ${CI_ENV_NS}"
echo "  ARC_RUNNERS_NS:      ${ARC_RUNNERS_NS}"
echo "  RUNNER_SA_NAME:      ${RUNNER_SA_NAME}"
echo ""

if ! oc get clusterversion version &>/dev/null; then
  echo "ERROR: This script targets OpenShift only."
  exit 1
fi

# --- Resolve controller image ---
if [[ -z "${CI_ENV_CONTROLLER_IMAGE:-}" ]]; then
  echo "Building controller image via setup-ci-env-runner-image.sh..."
  IMAGE_OUTPUT="$(CI_ENV_NS="${CI_ENV_NS}" bash "${CI_SCRIPTS_DIR}/images/setup-ci-env-runner-image.sh" 2>&1)"
  CI_ENV_CONTROLLER_IMAGE="$(echo "${IMAGE_OUTPUT}" | grep '^IMAGE_REF=' | cut -d= -f2-)"
  if [[ -z "${CI_ENV_CONTROLLER_IMAGE}" ]]; then
    echo "ERROR: setup-ci-env-runner-image.sh did not output IMAGE_REF="
    echo "${IMAGE_OUTPUT}"
    exit 1
  fi
  echo "Built image: ${CI_ENV_CONTROLLER_IMAGE}"
else
  echo "Using pre-built image: ${CI_ENV_CONTROLLER_IMAGE}"
fi

# --- Install / upgrade the chart ---
echo ""
echo "Running helm upgrade --install..."
helm upgrade --install ci-env-controller \
  "${CHART_DIR}" \
  --create-namespace \
  --set "namespace=${CI_ENV_NS}" \
  --set "image=${CI_ENV_CONTROLLER_IMAGE}" \
  --set "runner.saName=${RUNNER_SA_NAME}" \
  --set "runner.saNamespace=${ARC_RUNNERS_NS}" \
  --wait --timeout 120s

echo ""
echo "=== CI Environment Controller installation complete ==="
echo ""
echo "  Controller image:  ${CI_ENV_CONTROLLER_IMAGE}"
echo "  Controller NS:     ${CI_ENV_NS}"
echo "  Runner SA:         ${ARC_RUNNERS_NS}/${RUNNER_SA_NAME} (can create ConfigMaps in ${CI_ENV_NS})"
echo ""
echo "  To test, create a trigger ConfigMap:"
echo "    oc create -n ${CI_ENV_NS} -f - <<CM"
echo "    apiVersion: v1"
echo "    kind: ConfigMap"
echo "    metadata:"
echo "      name: ci-env-test"
echo "      labels:"
echo "        ci.kubevirt-plugin/type: test-environment"
echo "    data:"
echo "      desired-state: present"
echo "      plugin-image: ttl.sh/kubevirt-plugin-ci-test:1h"
echo "      test-namespace: ci-env-test-ns"
echo "    CM"
echo ""
