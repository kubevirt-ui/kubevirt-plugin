#!/bin/bash
#
# OpenShift only: create ImageStream + BuildConfig and run a binary Docker build for the
# custom ARC runner image (ci-scripts/arc/runner-image/Dockerfile).
#
# Output: prints IMAGE_REF= to stdout (and to ARC_RUNNER_IMAGE_FILE if set).
#
# Optional environment variables:
#   NS               Namespace for the runner (default: ci-env-images)
#   OC_VERSION       OpenShift client version build-arg (default: detect or 4.20)
#   HELM_VERSION     Helm version build-arg (default: 3.19.0)
#   VIRTCTL_VERSION  (default: v1.4.0)
#   YQ_VERSION       yq version build-arg (default: v4.52.5)
#
# Requires: oc logged into OpenShift; jq optional for version detection and URL resolution.
#
# Binary URL resolution:
#   Uses ci-scripts/_cluster-helpers.sh to resolve cluster resources

set -euo pipefail
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

source "${REPO_ROOT}/ci-scripts/_cluster-helpers.sh"
verify_oc

NS="${NS:-ci-env-images}"
IMAGE_DIR="${SCRIPT_DIR}/arc-runner"
IMAGE_NAME="arc-runner"

resolve_oc_version
VIRTCTL_VERSION="${VIRTCTL_VERSION:-v1.4.0}"
HELM_VERSION="${HELM_VERSION:-3.19.0}"
YQ_VERSION="${YQ_VERSION:-v4.52.5}"

resolve_cli_downloads

echo "=== Build ARC runner image (in-cluster, OpenShift) ==="
echo "  NS:              ${NS}"
echo "  IMAGE_DIR:       ${IMAGE_DIR}"
echo "  IMAGE_NAME:      ${IMAGE_NAME}"
echo "  OC_VERSION:      ${OC_VERSION}"
echo "  VIRTCTL_VERSION: ${VIRTCTL_VERSION}"
echo "  HELM_VERSION:    ${HELM_VERSION}"
echo "  YQ_VERSION:      ${YQ_VERSION}"
echo "  OC_URL:          ${OC_URL:-(fallback to mirror.openshift.com)}"
echo "  VIRTCTL_URL:     ${VIRTCTL_URL:-(fallback to GitHub releases)}"
echo "  HELM_URL:        ${HELM_URL:-(fallback to get.helm.sh)}"
echo ""

if [[ ! -f "${IMAGE_DIR}/Dockerfile" ]]; then
  echo "ERROR: Dockerfile not found at ${IMAGE_DIR}/Dockerfile"
  exit 1
fi

oc create namespace "${NS}" --dry-run=client -o yaml | oc apply -f -

oc apply -f - <<EOF
apiVersion: image.openshift.io/v1
kind: ImageStream
metadata:
  name: ${IMAGE_NAME}
  namespace: ${NS}
spec:
  lookupPolicy:
    local: true
EOF

oc apply -f - <<EOF
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: ${IMAGE_NAME}-build
  namespace: ${NS}
spec:
  source:
    type: Binary
    binary: {}
  strategy:
    type: Docker
    dockerStrategy:
      buildArgs:
        - name: OC_VERSION
          value: "${OC_VERSION}"
        - name: OC_URL
          value: "${OC_URL}"
        - name: VIRTCTL_VERSION
          value: "${VIRTCTL_VERSION}"
        - name: VIRTCTL_URL
          value: "${VIRTCTL_URL}"
        - name: HELM_VERSION
          value: "${HELM_VERSION}"
        - name: HELM_URL
          value: "${HELM_URL}"
        - name: YQ_VERSION
          value: "${YQ_VERSION}"
  output:
    to:
      kind: ImageStreamTag
      name: ${IMAGE_NAME}:latest
  runPolicy: Serial
EOF

echo "Starting binary build from ${IMAGE_DIR}..."
oc start-build -n "${NS}" "${IMAGE_NAME}-build" \
  --from-dir="${IMAGE_DIR}" \
  --follow

resolve_internal_registry
IMAGE_REF="${INTERNAL_REGISTRY}/${NS}/${IMAGE_NAME}:latest"

echo ""
echo "=== Build complete ==="
echo "Image: ${IMAGE_REF}"

# TODO: Better handling of passing the fqdn image name to the caller
if [[ -n "${ARC_RUNNER_IMAGE_FILE:-}" ]]; then
  printf '%s\n' "${IMAGE_REF}" > "${ARC_RUNNER_IMAGE_FILE}"
  echo "Wrote ${ARC_RUNNER_IMAGE_FILE}"
fi
echo "IMAGE_REF=${IMAGE_REF}"
