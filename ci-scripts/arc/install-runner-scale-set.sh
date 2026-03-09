#!/bin/bash
#
# Install gha-runner-scale-set (OpenShift): runner namespace, Helm release, optional dind
# post-render (mirror file or ARC_DIND_INTERNAL_IMAGE), SCC bind, CI RBAC.
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
#   ARC_SCALE_SET_LABELS        Optional comma-separated multilabel (ARC 0.14+)
#   CONTAINER_MODE              default dind; set to "none" to disable Docker-in-Docker
#   ARC_RUNNER_EXTRA_VALUES     Optional second Helm values file (merged after pod.yaml)
#   ARC_RUNNER_IMAGE            If set, use this image for the runner container
#   ARC_DIND_INTERNAL_IMAGE     If set, writes ci-scripts/generated/arc-dind-replace.env for this run
#                               (alternative to setup-dind-mirror.sh)
#   ARC_USE_DIND_POST_RENDER    Default 1; set to 0 to skip post-renderer
#   SKIP_ARC_RUNNER_RBAC        Set to 1 to skip applying ci-scripts/arc/arc-runner-rbac.yaml
#
# Pod template fragment: ci-scripts/arc/arc-runner-scale-set.pod.yaml

set -euo pipefail
ARC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_SCRIPTS_DIR="$(cd "${ARC_DIR}/.." && pwd)"
source "${CI_SCRIPTS_DIR}/ci-tools.sh"
source "${ARC_DIR}/arc-helm-helpers.sh"

RUNNER_POD_VALUES="${ARC_DIR}/arc-runner-scale-set.pod.yaml"
if [[ ! -f "${RUNNER_POD_VALUES}" ]]; then
  echo "ERROR: Missing ${RUNNER_POD_VALUES}"
  exit 1
fi

ARC_CONFIG_URL="${ARC_CONFIG_URL:?ARC_CONFIG_URL is required}"
RUNNER_SCALE_SET_NAME="${RUNNER_SCALE_SET_NAME:-kubevirt-plugin-ci}"
MIN_RUNNERS="${MIN_RUNNERS:-0}"
MAX_RUNNERS="${MAX_RUNNERS:-5}"
ARC_CONTROLLER_NS="${ARC_CONTROLLER_NS:-arc-systems}"
ARC_CONTROLLER_INSTALL_NAME="${ARC_CONTROLLER_INSTALL_NAME:-arc}"
ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
ARC_VERSION="${ARC_VERSION:-0.14.0}"
CONTAINER_MODE="${CONTAINER_MODE:-dind}"
[[ "${CONTAINER_MODE}" == "none" || "${CONTAINER_MODE}" == "disabled" ]] && CONTAINER_MODE=""
ARC_HELM_REPO="oci://ghcr.io/actions/actions-runner-controller-charts"

echo "=== ARC runner scale set installation (OpenShift) ==="
echo "  ARC_CONFIG_URL:              ${ARC_CONFIG_URL}"
echo "  RUNNER_SCALE_SET_NAME:       ${RUNNER_SCALE_SET_NAME}"
echo "  MIN_RUNNERS / MAX_RUNNERS:   ${MIN_RUNNERS} / ${MAX_RUNNERS}"
echo "  ARC_CONTROLLER_NS:           ${ARC_CONTROLLER_NS}"
echo "  ARC_CONTROLLER_INSTALL_NAME: ${ARC_CONTROLLER_INSTALL_NAME}"
echo "  ARC_RUNNERS_NS:              ${ARC_RUNNERS_NS}"
echo "  ARC_VERSION:                 ${ARC_VERSION}"
echo "  CONTAINER_MODE:              ${CONTAINER_MODE:-"(none — no dind)"}"
echo "  Runner pod values:           ${RUNNER_POD_VALUES}"
echo ""

ensure_helm
ensure_oc

if ! oc get clusterversion version &>/dev/null; then
  echo "ERROR: This script targets OpenShift only."
  exit 1
fi

if [[ -n "${ARC_DIND_INTERNAL_IMAGE:-}" && "${ARC_USE_DIND_POST_RENDER:-1}" != "0" ]]; then
  mkdir -p "${CI_SCRIPTS_DIR}/generated"
  printf 'ARC_DIND_INTERNAL_IMAGE=%s\n' "${ARC_DIND_INTERNAL_IMAGE}" > "${CI_SCRIPTS_DIR}/generated/arc-dind-replace.env"
  echo "Wrote ${CI_SCRIPTS_DIR}/generated/arc-dind-replace.env from ARC_DIND_INTERNAL_IMAGE"
fi

echo "Creating namespace ${ARC_RUNNERS_NS}..."
oc create namespace "${ARC_RUNNERS_NS}" --dry-run=client -o yaml | oc apply -f -

AUTH_ARGS=()
if ! arc_github_config_secret_helm_auth AUTH_ARGS; then
  exit 1
fi

CONTROLLER_SA_NAME="${ARC_CONTROLLER_INSTALL_NAME}-gha-rs-controller"

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
if [[ -n "${CONTAINER_MODE:-}" ]]; then
  echo "Enabling container mode: ${CONTAINER_MODE} (Docker-in-Docker)"
  RUNNER_SET_ARGS+=(--set "containerMode.type=${CONTAINER_MODE}")
fi
if [[ -n "${ARC_RUNNER_EXTRA_VALUES:-}" && -f "${ARC_RUNNER_EXTRA_VALUES}" ]]; then
  echo "Merging extra Helm values: ${ARC_RUNNER_EXTRA_VALUES}"
  RUNNER_SET_ARGS+=(--values "${ARC_RUNNER_EXTRA_VALUES}")
fi
if [[ -n "${ARC_VERSION}" && "${ARC_VERSION}" != "latest" ]]; then
  RUNNER_SET_ARGS+=(--version "${ARC_VERSION}")
fi
arc_helm_append_scale_set_labels RUNNER_SET_ARGS
arc_helm_append_dind_post_renderer RUNNER_SET_ARGS "${ARC_DIR}" "${CI_SCRIPTS_DIR}"

echo "Installing runner scale set '${RUNNER_SCALE_SET_NAME}'..."
helm upgrade --install "${RUNNER_SCALE_SET_NAME}" \
  --namespace "${ARC_RUNNERS_NS}" \
  "${RUNNER_SET_ARGS[@]}" \
  "${ARC_HELM_REPO}/gha-runner-scale-set" \
  --wait

[[ -n "${AUTH_VALUES_FILE:-}" ]] && rm -f "${AUTH_VALUES_FILE}"

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
  sed \
    -e "s/^    name: kubevirt-plugin-ci-gha-rs-no-permission\$/    name: ${RUNNER_SA}/" \
    -e "s/^    namespace: arc-runners\$/    namespace: ${ARC_RUNNERS_NS}/" \
    "${RUNNER_RBAC_MANIFEST}" | oc apply -f -
  echo "  (Additional scale sets: set SKIP_ARC_RUNNER_RBAC=1 and bind arc-runner-ci per SA, e.g. oc adm policy add-cluster-role-to-user arc-runner-ci -z <sa> -n <ns>.)"
else
  echo "SKIP_ARC_RUNNER_RBAC=1 — not applying ${RUNNER_RBAC_MANIFEST}"
fi

echo ""
echo "=== Runner scale set installation complete ==="
echo "  runs-on: ${RUNNER_SCALE_SET_NAME}"
echo "  To refresh runner image: re-run this script with ARC_RUNNER_IMAGE set (after setup-runner-image.sh)."
echo ""
echo "Disable dind: CONTAINER_MODE=none and re-run this script."
