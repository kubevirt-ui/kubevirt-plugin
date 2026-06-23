#!/bin/bash
#
# Install gha-runner-scale-set (OpenShift): runner namespace, Helm release,
# SCC bind, CI RBAC.
# Requires install-arc-controller.sh (or equivalent controller + SCC) already applied.
#
# Required environment variables:
#   ARC_CONFIG_URL         - Repository or org URL (e.g., https://github.com/org/repo)
#
# Authentication (one of):
#   ARC_APP_ID + ARC_APP_INSTALL_ID + ARC_APP_PRIVATE_KEY  (GitHub App, recommended)
#   ARC_PAT                                                (PAT with admin:repo)
#
# Optional environment variables:
#   RUNNER_SCALE_SET_NAME       (default: kubevirt-plugin-ci)
#   MIN_RUNNERS / MAX_RUNNERS   (default: 0 / 5)
#   ARC_CONTROLLER_NS           (default: arc-systems) — must match controller install
#   ARC_CONTROLLER_INSTALL_NAME (default: arc)
#   ARC_RUNNERS_NS              (default: arc-runners)
#   ARC_VERSION                 Helm chart version (default: 0.14.0); set to "latest" to omit --version
#   ARC_RUNNER_IMAGE            If set, use this image for the runner container
#   ARC_RUNNER_EXTRA_VALUES     Optional extra Helm values file (e.g. FIPS workarounds)
#   SKIP_ARC_RUNNER_RBAC        Set to 1 to skip applying ci-scripts/arc/arc-runner-rbac.yaml
#
# Pod template fragment: ci-scripts/arc/arc-runner-scale-set.pod.yaml

set -euo pipefail
ARC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_SCRIPTS_DIR="$(cd "${ARC_DIR}/.." && pwd)"
source "${CI_SCRIPTS_DIR}/_cluster-helpers.sh"
verify_oc

source "${ARC_DIR}/arc-helm-helpers.sh"

RUNNER_POD_VALUES="${ARC_DIR}/arc-runner-scale-set.pod.yaml"
if [[ ! -f "${RUNNER_POD_VALUES}" ]]; then
  echo "ERROR: Missing ${RUNNER_POD_VALUES}"
  exit 1
fi

ARC_CONFIG_URL="${ARC_CONFIG_URL:?ARC_CONFIG_URL is required}"
ARC_CONTROLLER_NS="${ARC_CONTROLLER_NS:-arc-systems}"
ARC_CONTROLLER_INSTALL_NAME="${ARC_CONTROLLER_INSTALL_NAME:-arc}"
ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
ARC_HELM_REPO="oci://ghcr.io/actions/actions-runner-controller-charts"
ARC_VERSION="${ARC_VERSION:-0.14.0}"
RUNNER_SCALE_SET_NAME="${RUNNER_SCALE_SET_NAME:-kubevirt-plugin-ci}"
MIN_RUNNERS="${MIN_RUNNERS:-0}"
MAX_RUNNERS="${MAX_RUNNERS:-5}"
if ! [[ "${MIN_RUNNERS}" =~ ^[0-9]+$ && "${MAX_RUNNERS}" =~ ^[0-9]+$ ]]; then
  echo "ERROR: MIN_RUNNERS and MAX_RUNNERS must be non-negative integers"
  exit 1
fi
if (( MIN_RUNNERS > MAX_RUNNERS )); then
  echo "ERROR: MIN_RUNNERS cannot be greater than MAX_RUNNERS"
  exit 1
fi
CONTROLLER_SA_NAME="${ARC_CONTROLLER_INSTALL_NAME}-gha-rs-controller"

echo "=== ARC runner scale set installation (OpenShift) ==="
echo "  ARC_CONFIG_URL:              ${ARC_CONFIG_URL}"
echo "  ARC_CONTROLLER_NS:           ${ARC_CONTROLLER_NS}"
echo "  ARC_CONTROLLER_INSTALL_NAME: ${ARC_CONTROLLER_INSTALL_NAME}"
echo "  ARC_RUNNERS_NS:              ${ARC_RUNNERS_NS}"
echo "  ARC_RUNNER_IMAGE:            ${ARC_RUNNER_IMAGE:-(not set, will use default)}"
echo "  ARC_HELM_REPO:               ${ARC_HELM_REPO}"
echo "  ARC_VERSION:                 ${ARC_VERSION}"
echo "  RUNNER_SCALE_SET_NAME:       ${RUNNER_SCALE_SET_NAME}"
echo "  MIN_RUNNERS / MAX_RUNNERS:   ${MIN_RUNNERS} / ${MAX_RUNNERS}"
echo "  Runner pod values:           ${RUNNER_POD_VALUES}"
echo "  Controller SA name:          ${CONTROLLER_SA_NAME}"
echo ""

echo "Creating namespace ${ARC_RUNNERS_NS}..."
oc create namespace "${ARC_RUNNERS_NS}" --dry-run=client -o yaml | oc apply -f -

AUTH_ARGS=()
if ! arc_github_config_secret_helm_auth AUTH_ARGS; then
  exit 1
fi

RUNNER_SET_ARGS=(
  --set "githubConfigUrl=${ARC_CONFIG_URL}"
  --set "minRunners=${MIN_RUNNERS}"
  --set "maxRunners=${MAX_RUNNERS}"
  --set "controllerServiceAccount.name=${CONTROLLER_SA_NAME}"
  --set "controllerServiceAccount.namespace=${ARC_CONTROLLER_NS}"
  "${AUTH_ARGS[@]}"
  --values "${RUNNER_POD_VALUES}"
)
if [[ -n "${ARC_RUNNER_IMAGE:-}" ]]; then
  echo "Using runner image from ARC_RUNNER_IMAGE"
  RUNNER_SET_ARGS+=(--set-string "template.spec.containers[0].image=${ARC_RUNNER_IMAGE}")
fi
if [[ -n "${ARC_RUNNER_EXTRA_VALUES:-}" ]]; then
  if [[ ! -f "${ARC_RUNNER_EXTRA_VALUES}" ]]; then
    echo "ERROR: ARC_RUNNER_EXTRA_VALUES file not found: ${ARC_RUNNER_EXTRA_VALUES}"
    exit 1
  fi
  echo "Merging extra Helm values from ${ARC_RUNNER_EXTRA_VALUES}"
  RUNNER_SET_ARGS+=(--values "${ARC_RUNNER_EXTRA_VALUES}")
fi
if [[ -n "${ARC_VERSION}" && "${ARC_VERSION}" != "latest" ]]; then
  RUNNER_SET_ARGS+=(--version "${ARC_VERSION}")
fi

echo "Installing runner scale set '${RUNNER_SCALE_SET_NAME}'..."
helm upgrade \
  "${RUNNER_SCALE_SET_NAME}" \
  "${ARC_HELM_REPO}/gha-runner-scale-set" \
  --install \
  --namespace "${ARC_RUNNERS_NS}" \
  "${RUNNER_SET_ARGS[@]}" \
  --wait --timeout 5m

RUNNER_SA="${RUNNER_SCALE_SET_NAME}-gha-rs-no-permission"
echo "Binding SCC github-arc to runner ServiceAccount ${RUNNER_SA}..."
oc policy add-role-to-user system:openshift:scc:github-arc -z "${RUNNER_SA}" -n "${ARC_RUNNERS_NS}"

RUNNER_RBAC_MANIFEST="${ARC_DIR}/arc-runner-rbac.yaml"
if [[ "${SKIP_ARC_RUNNER_RBAC:-0}" != "1" ]]; then
  if [[ ! -f "${RUNNER_RBAC_MANIFEST}" ]]; then
    echo "ERROR: Missing ${RUNNER_RBAC_MANIFEST}"
    exit 1
  fi
  echo "Applying runner CI RBAC (ClusterRole arc-runner-ci → ${RUNNER_SA} in ${ARC_RUNNERS_NS})..."
  DEFAULT_RUNNER_SA='kubevirt-plugin-ci-gha-rs-no-permission'
  DEFAULT_RUNNERS_NS='arc-runners'
  if ! grep -qF "    name: ${DEFAULT_RUNNER_SA}" "${RUNNER_RBAC_MANIFEST}"; then
    echo "ERROR: ${RUNNER_RBAC_MANIFEST} missing placeholder ServiceAccount '${DEFAULT_RUNNER_SA}'"
    exit 1
  fi
  if ! grep -qF "    namespace: ${DEFAULT_RUNNERS_NS}" "${RUNNER_RBAC_MANIFEST}"; then
    echo "ERROR: ${RUNNER_RBAC_MANIFEST} missing placeholder namespace '${DEFAULT_RUNNERS_NS}'"
    exit 1
  fi
  RBAC_RENDERED=$(
    sed \
      -e "s/^    name: ${DEFAULT_RUNNER_SA}\$/    name: ${RUNNER_SA}/" \
      -e "s/^    namespace: ${DEFAULT_RUNNERS_NS}\$/    namespace: ${ARC_RUNNERS_NS}/" \
      "${RUNNER_RBAC_MANIFEST}"
  )
  if ! grep -qF "    name: ${RUNNER_SA}" <<< "${RBAC_RENDERED}"; then
    echo "ERROR: RBAC substitution failed for ServiceAccount '${RUNNER_SA}'"
    exit 1
  fi
  if ! grep -qF "    namespace: ${ARC_RUNNERS_NS}" <<< "${RBAC_RENDERED}"; then
    echo "ERROR: RBAC substitution failed for namespace '${ARC_RUNNERS_NS}'"
    exit 1
  fi
  echo "${RBAC_RENDERED}" | oc apply -f -
  echo "  (Additional scale sets: set SKIP_ARC_RUNNER_RBAC=1 and bind arc-runner-ci per SA, e.g. oc adm policy add-cluster-role-to-user arc-runner-ci -z <sa> -n <ns>.)"
else
  echo "SKIP_ARC_RUNNER_RBAC=1 — not applying ${RUNNER_RBAC_MANIFEST}"
fi

echo ""
echo "=== Runner scale set installation complete ==="
echo "  runs-on: ${RUNNER_SCALE_SET_NAME}"
echo "  To refresh runner image: re-run this script with ARC_RUNNER_IMAGE set (after setup-arc-runner-image.sh)."
echo ""
