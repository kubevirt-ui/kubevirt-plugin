#!/bin/bash
#
# Install ARC controller only (OpenShift): namespace, SCC, Helm gha-runner-scale-set-controller.
# Pair with install-runner-scale-set.sh for the AutoscalingRunnerSet release.
#
# Optional environment variables:
#   ARC_CONTROLLER_NS           (default: arc-systems)
#   ARC_CONTROLLER_INSTALL_NAME (default: arc → SA arc-gha-rs-controller)
#   ARC_VERSION                 Helm chart version (default: 0.14.0); set to "latest" to omit --version
#
# Prerequisites: oc login to OpenShift; helm

set -euo pipefail
ARC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_SCRIPTS_DIR="$(cd "${ARC_DIR}/.." && pwd)"
source "${CI_SCRIPTS_DIR}/_cluster-helpers.sh"
verify_oc

ARC_CONTROLLER_NS="${ARC_CONTROLLER_NS:-arc-systems}"
ARC_CONTROLLER_INSTALL_NAME="${ARC_CONTROLLER_INSTALL_NAME:-arc}"
ARC_HELM_REPO="oci://ghcr.io/actions/actions-runner-controller-charts"
ARC_VERSION="${ARC_VERSION:-0.14.0}"

echo "=== ARC controller installation (OpenShift) ==="
echo "  ARC_CONTROLLER_NS:           ${ARC_CONTROLLER_NS}"
echo "  ARC_CONTROLLER_INSTALL_NAME: ${ARC_CONTROLLER_INSTALL_NAME}"
echo "  ARC_HELM_REPO:               ${ARC_HELM_REPO}"
echo "  ARC_VERSION:                 ${ARC_VERSION}"
echo ""

echo "Creating namespace ${ARC_CONTROLLER_NS}..."
oc create namespace "${ARC_CONTROLLER_NS}" --dry-run=client -o yaml | oc apply -f -

echo "Applying ARC SCC and ClusterRole (github-arc)..."
oc apply -f "${ARC_DIR}/arc-openshift-scc.yaml"

CONTROLLER_ARGS=(--namespace "${ARC_CONTROLLER_NS}")
if [[ -n "${ARC_VERSION}" && "${ARC_VERSION}" != "latest" ]]; then
  CONTROLLER_ARGS+=(--version "${ARC_VERSION}")
fi

CONTROLLER_SA_NAME="${ARC_CONTROLLER_INSTALL_NAME}-gha-rs-controller"
CONTROLLER_ARGS+=(--set "serviceAccount.name=${CONTROLLER_SA_NAME}")

echo "Installing ARC controller (Helm release: ${ARC_CONTROLLER_INSTALL_NAME})..."
helm upgrade --install "${ARC_CONTROLLER_INSTALL_NAME}" \
  "${CONTROLLER_ARGS[@]}" \
  "${ARC_HELM_REPO}/gha-runner-scale-set-controller" \
  --wait

echo ""
echo "=== ARC controller installation complete ==="
echo ""
