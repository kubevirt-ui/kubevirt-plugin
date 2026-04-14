#!/bin/bash
#
# OpenShift only: create ImageStream + BuildConfig and run a binary Docker build for the
# ci-env-controller image (ci-scripts/ci-env/controller-image/Dockerfile).
#
# Output: prints IMAGE_REF= to stdout (and to CI_ENV_CONTROLLER_IMAGE_FILE if set).
#
# Optional environment variables:
#   CI_ENV_NS              Namespace for the controller (default: ci-env)
#   OC_VERSION             OpenShift client version build-arg (default: detect or 4.20)
#   HELM_VERSION           Helm version build-arg (default: 3.19.0)
#   YQ_VERSION             yq version build-arg (default: v4.52.5)
#
# Requires: oc logged into OpenShift; jq optional for version detection and URL resolution.
#
# Binary URL resolution:
#   Uses ci-scripts/_cluster-helpers.sh to query ConsoleCLIDownload resources for
#   exact binary download URLs (oc, helm) matching the live cluster.
#   These are passed to the Docker build as OC_URL and HELM_URL build-args.
#   If resolution fails (CRD not found, jq absent, etc.), the Dockerfile falls back to
#   mirror.openshift.com / get.helm.sh using OC_VERSION / HELM_VERSION.

set -euo pipefail
CI_ENV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_SCRIPTS_DIR="$(cd "${CI_ENV_DIR}/.." && pwd)"

CI_ENV_NS="${CI_ENV_NS:-ci-env}"
CONTROLLER_IMAGE_DIR="${CI_ENV_DIR}/controller-image"

if ! oc get clusterversion version &>/dev/null; then
  echo "ERROR: OpenShift cluster required (clusterversion.version not found)."
  exit 1
fi

source "${CI_SCRIPTS_DIR}/_cluster-helpers.sh"

resolve_oc_version
HELM_VERSION="${HELM_VERSION:-3.19.0}"
YQ_VERSION="${YQ_VERSION:-v4.52.5}"

resolve_cli_downloads

echo "=== Build ci-env-controller image (in-cluster, OpenShift) ==="
echo "  CI_ENV_NS:            ${CI_ENV_NS}"
echo "  OC_VERSION:           ${OC_VERSION}"
echo "  HELM_VERSION:         ${HELM_VERSION}"
echo "  YQ_VERSION:           ${YQ_VERSION}"
echo "  CONTROLLER_IMAGE_DIR: ${CONTROLLER_IMAGE_DIR}"
echo "  OC_URL:               ${OC_URL:-(fallback to mirror.openshift.com)}"
echo "  HELM_URL:             ${HELM_URL:-(fallback to get.helm.sh)}"
echo ""

if [[ ! -f "${CONTROLLER_IMAGE_DIR}/Dockerfile" ]]; then
  echo "ERROR: Dockerfile not found at ${CONTROLLER_IMAGE_DIR}/Dockerfile"
  exit 1
fi

BC_NAME="ci-env-controller"

oc create namespace "${CI_ENV_NS}" --dry-run=client -o yaml | oc apply -f -

oc apply -f - <<EOF
apiVersion: image.openshift.io/v1
kind: ImageStream
metadata:
  name: ${BC_NAME}
  namespace: ${CI_ENV_NS}
spec:
  lookupPolicy:
    local: true
EOF

oc apply -f - <<EOF
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: ${BC_NAME}
  namespace: ${CI_ENV_NS}
spec:
  source:
    type: Binary
    binary: {}
  strategy:
    type: Docker
    dockerStrategy:
      dockerfilePath: Dockerfile
      buildArgs:
        - name: YQ_VERSION
          value: "${YQ_VERSION}"
        - name: OC_VERSION
          value: "${OC_VERSION}"
        - name: HELM_VERSION
          value: "${HELM_VERSION}"
        - name: OC_URL
          value: "${OC_URL}"
        - name: HELM_URL
          value: "${HELM_URL}"
  output:
    to:
      kind: ImageStreamTag
      name: ${BC_NAME}:latest
  runPolicy: Serial
EOF

# The controller-image/ directory contains a symlink to the Helm chart.
# Use tar -ch to dereference symlinks so the build pod receives the actual
# chart files (including templates/ subdirectory), then pipe to --from-archive.
echo "Starting binary build from ${CONTROLLER_IMAGE_DIR} (dereferencing symlinks)..."
tar -ch -C "${CONTROLLER_IMAGE_DIR}" . \
  | oc start-build -n "${CI_ENV_NS}" "${BC_NAME}" \
      --from-archive=- \
      --follow

INTERNAL_REGISTRY="$(oc get image.config.openshift.io/cluster \
  -o jsonpath='{.status.internalRegistryHostname}' 2>/dev/null \
  || echo 'image-registry.openshift-image-registry.svc:5000')"
IMAGE_REF="${INTERNAL_REGISTRY}/${CI_ENV_NS}/${BC_NAME}:latest"

echo ""
echo "=== Build complete ==="
echo "Image: ${IMAGE_REF}"
if [[ -n "${CI_ENV_CONTROLLER_IMAGE_FILE:-}" ]]; then
  printf '%s\n' "${IMAGE_REF}" > "${CI_ENV_CONTROLLER_IMAGE_FILE}"
  echo "Wrote ${CI_ENV_CONTROLLER_IMAGE_FILE}"
fi

echo "IMAGE_REF=${IMAGE_REF}"
