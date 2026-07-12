#!/bin/bash
#
# One-time, per-cluster bootstrap of the ARC runner ServiceAccount's
# ImageStream/BuildConfig RBAC inside the manual-console namespace
# (CNV-92150). Creates the namespace if needed, then applies
# manual-console-rbac.yaml with its ServiceAccount subject substituted for
# the cluster's actual runner scale set name -- mirrors
# ../hot-cluster/arc/install-runner-scale-set.sh's own substitution of
# arc-runner-rbac.yaml, for the same reason: the raw manifest hardcodes the
# "kubevirt-plugin-ci" default, which never matches a release cluster's
# runner SA (e.g. "kubevirt-plugin-420-gha-rs-no-permission").
#
# Optional environment variables:
#   RUNNER_SCALE_SET_NAME (default: kubevirt-plugin-ci)
#   ARC_RUNNERS_NS         (default: arc-runners)
#   MANUAL_CONSOLE_NS      (default: manual-console)
#
# Requires: oc logged into the target cluster as a cluster-admin.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

source "${REPO_ROOT}/ci-scripts/_cluster-helpers.sh"
verify_oc

RUNNER_SCALE_SET_NAME="${RUNNER_SCALE_SET_NAME:-kubevirt-plugin-ci}"
ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
MANUAL_CONSOLE_NS="${MANUAL_CONSOLE_NS:-manual-console}"
RUNNER_SA="${RUNNER_SCALE_SET_NAME}-gha-rs-no-permission"
RBAC_MANIFEST="${SCRIPT_DIR}/manual-console-rbac.yaml"

echo "=== Manual console RBAC bootstrap ==="
echo "  RUNNER_SCALE_SET_NAME: ${RUNNER_SCALE_SET_NAME}"
echo "  ARC_RUNNERS_NS:        ${ARC_RUNNERS_NS}"
echo "  MANUAL_CONSOLE_NS:     ${MANUAL_CONSOLE_NS}"
echo "  Runner SA:             ${RUNNER_SA}"
echo ""

if [[ ! -f "${RBAC_MANIFEST}" ]]; then
  echo "ERROR: Missing ${RBAC_MANIFEST}"
  exit 1
fi

echo "Creating namespace ${MANUAL_CONSOLE_NS}..."
oc create namespace "${MANUAL_CONSOLE_NS}" --dry-run=client -o yaml | oc apply -f -

echo "Applying manual-console RBAC (Role manual-console-image-build → ${RUNNER_SA} in ${ARC_RUNNERS_NS})..."
RENDERED="$(sed \
  -e "s/^  namespace: manual-console\$/  namespace: ${MANUAL_CONSOLE_NS}/" \
  -e "s/^    name: kubevirt-plugin-ci-gha-rs-no-permission\$/    name: ${RUNNER_SA}/" \
  -e "s/^    namespace: arc-runners\$/    namespace: ${ARC_RUNNERS_NS}/" \
  "${RBAC_MANIFEST}")"

# Guard against a silent no-op sed: if manual-console-rbac.yaml's indentation
# or literal text ever drifts from what these patterns match, sed exits 0
# but leaves the defaults untouched -- applying RBAC for the wrong SA/
# namespace without any error (exactly the class of bug this script exists
# to fix elsewhere). Fail loudly instead.
if ! grep -q "name: ${RUNNER_SA}\$" <<<"${RENDERED}" || ! grep -q "namespace: ${ARC_RUNNERS_NS}\$" <<<"${RENDERED}"; then
  echo "ERROR: sed substitution did not produce the expected ServiceAccount subject" >&2
  echo "  (expected 'name: ${RUNNER_SA}' and 'namespace: ${ARC_RUNNERS_NS}' in the rendered manifest)." >&2
  echo "  manual-console-rbac.yaml's format likely changed -- update this script's sed patterns." >&2
  exit 1
fi
if [[ "${MANUAL_CONSOLE_NS}" != "manual-console" ]] && ! grep -q "namespace: ${MANUAL_CONSOLE_NS}\$" <<<"${RENDERED}"; then
  echo "ERROR: sed substitution did not rename the manual-console namespace to '${MANUAL_CONSOLE_NS}'." >&2
  exit 1
fi

oc apply -f - <<<"${RENDERED}"

echo ""
echo "=== Manual console RBAC bootstrap complete ==="
