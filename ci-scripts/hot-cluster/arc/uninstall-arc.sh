#!/bin/bash
#
# Uninstall ARC runner scale set and controller (reverse of install-runner-scale-set.sh
# and install-arc-controller.sh). Uses the same environment variables so setup and
# teardown stay in sync.
#
# Optional environment variables:
#   RUNNER_SCALE_SET_NAME       (default: kubevirt-plugin-ci)
#   ARC_RUNNERS_NS              (default: arc-runners)
#   ARC_CONTROLLER_INSTALL_NAME (default: arc)
#   ARC_CONTROLLER_NS           (default: arc-systems)
#
# Prerequisites: helm, oc/kubectl with cluster access

set -euo pipefail

RUNNER_SCALE_SET_NAME="${RUNNER_SCALE_SET_NAME:-kubevirt-plugin-ci}"
ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
ARC_CONTROLLER_INSTALL_NAME="${ARC_CONTROLLER_INSTALL_NAME:-arc}"
ARC_CONTROLLER_NS="${ARC_CONTROLLER_NS:-arc-systems}"

echo "=== ARC uninstall ==="
echo "  RUNNER_SCALE_SET_NAME:       ${RUNNER_SCALE_SET_NAME}"
echo "  ARC_RUNNERS_NS:              ${ARC_RUNNERS_NS}"
echo "  ARC_CONTROLLER_INSTALL_NAME: ${ARC_CONTROLLER_INSTALL_NAME}"
echo "  ARC_CONTROLLER_NS:           ${ARC_CONTROLLER_NS}"
echo ""

echo "Uninstalling ARC runner scale set '${RUNNER_SCALE_SET_NAME}' from namespace '${ARC_RUNNERS_NS}'..."
helm uninstall "${RUNNER_SCALE_SET_NAME}" \
  --namespace "${ARC_RUNNERS_NS}" \
  --wait --timeout 5m 2>/dev/null \
  || echo "Runner scale set '${RUNNER_SCALE_SET_NAME}' not found or already removed"

echo "Uninstalling ARC controller '${ARC_CONTROLLER_INSTALL_NAME}' from namespace '${ARC_CONTROLLER_NS}'..."
helm uninstall "${ARC_CONTROLLER_INSTALL_NAME}" \
  --namespace "${ARC_CONTROLLER_NS}" \
  --wait --timeout 5m 2>/dev/null \
  || echo "ARC controller '${ARC_CONTROLLER_INSTALL_NAME}' not found or already removed"

echo ""
echo "=== ARC uninstall complete ==="
