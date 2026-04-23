#!/bin/bash
#
# OpenShift only: create ImageStream + BuildConfig and run a binary Docker build for the
# ci-env-controller image (ci-scripts/ci-env/controller-image/Dockerfile).
#
# Output: prints IMAGE_REF= to stdout (and to CI_ENV_CONTROLLER_IMAGE_FILE if set).
#
# Optional environment variables:
#   NS                     Namespace for the controller (default: ci-env-images)
#   OC_VERSION             OpenShift client version build-arg (default: detect or 4.20)
#   HELM_VERSION           Helm version build-arg (default: 3.19.0)
#   YQ_VERSION             yq version build-arg (default: v4.52.5)
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
IMAGE_DIR="${SCRIPT_DIR}/ci-env-runner"
IMAGE_NAME="ci-env-runner"

resolve_oc_version
HELM_VERSION="${HELM_VERSION:-3.19.0}"
YQ_VERSION="${YQ_VERSION:-v4.52.5}"

resolve_cli_downloads

echo "=== Build ci-env-runner image (in-cluster, OpenShift) ==="
echo "  NS:                   ${NS}"
echo "  IMAGE_DIR:            ${IMAGE_DIR}"
echo "  IMAGE_NAME:           ${IMAGE_NAME}"
echo "  OC_VERSION:           ${OC_VERSION}"
echo "  HELM_VERSION:         ${HELM_VERSION}"
echo "  YQ_VERSION:           ${YQ_VERSION}"
echo "  OC_URL:               ${OC_URL:-(fallback to mirror.openshift.com)}"
echo "  HELM_URL:             ${HELM_URL:-(fallback to get.helm.sh)}"
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
      dockerfilePath: Dockerfile
      buildArgs:
        - name: OC_VERSION
          value: "${OC_VERSION}"
        - name: OC_URL
          value: "${OC_URL}"
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

# The controller-image/ directory contains a symlink to the Helm chart.
# Use tar -ch to dereference symlinks so the build pod receives the actual
# chart files (including templates/ subdirectory), then pipe to --from-archive.
echo "Starting binary build from ${IMAGE_DIR} (dereferencing symlinks)..."
tar -ch -C "${IMAGE_DIR}" . \
  | oc start-build -n "${NS}" "${IMAGE_NAME}-build" \
      --from-archive=- \
      --follow

resolve_internal_registry
IMAGE_REF="${INTERNAL_REGISTRY}/${NS}/${IMAGE_NAME}:latest"

echo ""
echo "=== Build complete ==="
echo "Image: ${IMAGE_REF}"

# TODO: Better handling of passing the fqdn image name to the caller
if [[ -n "${CI_ENV_RUNNER_IMAGE_FILE:-}" ]]; then
  printf '%s\n' "${IMAGE_REF}" > "${CI_ENV_RUNNER_IMAGE_FILE}"
  echo "Wrote ${CI_ENV_RUNNER_IMAGE_FILE}"
fi
echo "IMAGE_REF=${IMAGE_REF}"
