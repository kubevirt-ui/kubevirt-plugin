#!/bin/bash
#
# OpenShift only: create ImageStream + BuildConfig and run a binary Docker build
# for the kubevirt-plugin image (repo root Dockerfile), for the manual-console
# deploy path (CNV-92150). This mirrors the ci-env-runner/arc-runner image
# build scripts but builds the actual plugin from the checked-out branch,
# instead of a static tool image, so no image tag/registry push is required.
#
# Output: prints IMAGE_REF= to stdout (and to PLUGIN_IMAGE_FILE if set).
#
# Optional environment variables:
#   NS                    Namespace for the build (default: manual-console)
#   IMAGE_NAME            ImageStream/BuildConfig name (default: kubevirt-plugin)
#   BUILD_DIR             Directory to build from (default: repo root)
#   BUILD_TIMEOUT_SECONDS Wrap the build in `timeout` if set (default: unset = no limit)
#
# Requires: oc logged into OpenShift; run from a checkout of the branch to deploy.
#
# Namespace note: If the namespace does not match the console/plugin Deployment
# namespace, the running service account will need role "system:image-puller"
# so the built image can be pulled (ci-env-controller's console/plugin SAs
# already have this via the ci-test-stack chart's namespace-local defaults).
#
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

source "${REPO_ROOT}/ci-scripts/_cluster-helpers.sh"
verify_oc

NS="${NS:-manual-console}"
IMAGE_NAME="${IMAGE_NAME:-kubevirt-plugin}"
BUILD_DIR="${BUILD_DIR:-${REPO_ROOT}}"

if [[ ! -f "${BUILD_DIR}/Dockerfile" ]]; then
  echo "ERROR: Dockerfile not found at ${BUILD_DIR}/Dockerfile"
  exit 1
fi

echo "=== Build kubevirt-plugin image (in-cluster, OpenShift) ==="
echo "  NS:         ${NS}"
echo "  IMAGE_NAME: ${IMAGE_NAME}"
echo "  BUILD_DIR:  ${BUILD_DIR}"
echo ""

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
  output:
    to:
      kind: ImageStreamTag
      name: ${IMAGE_NAME}:latest
  runPolicy: Serial
EOF

echo "Waiting for ImageStream to be resolvable..."
for i in $(seq 1 12); do
  REPO=$(oc get imagestream "${IMAGE_NAME}" -n "${NS}" -o jsonpath='{.status.dockerImageRepository}' 2>/dev/null)
  if [[ -n "${REPO}" ]]; then
    echo "  ImageStream ready: ${REPO}"
    break
  fi
  echo "  Waiting... (${i}/12)"
  sleep 5
done

BUILD_CMD=(oc start-build -n "${NS}" "${IMAGE_NAME}-build" --from-dir="${BUILD_DIR}" --follow)

echo "Starting binary build from ${BUILD_DIR}..."
for attempt in 1 2 3; do
  if [[ -n "${BUILD_TIMEOUT_SECONDS:-}" ]] && command -v timeout &>/dev/null; then
    RUN_RESULT=0
    timeout "${BUILD_TIMEOUT_SECONDS}" "${BUILD_CMD[@]}" || RUN_RESULT=$?
  else
    RUN_RESULT=0
    "${BUILD_CMD[@]}" || RUN_RESULT=$?
  fi

  if [[ "${RUN_RESULT}" -eq 0 ]]; then
    break
  fi
  if [[ "${attempt}" -lt 3 ]]; then
    echo "  Build attempt ${attempt}/3 failed (exit ${RUN_RESULT}), retrying in 15s..."
    sleep 15
  else
    echo "  Build failed after 3 attempts"
    exit 1
  fi
done

resolve_internal_registry
IMAGE_REF="${INTERNAL_REGISTRY}/${NS}/${IMAGE_NAME}:latest"

echo ""
echo "=== Build complete ==="
echo "Image: ${IMAGE_REF}"
echo ""

if [[ -n "${PLUGIN_IMAGE_FILE:-}" ]]; then
  printf '%s\n' "${IMAGE_REF}" > "${PLUGIN_IMAGE_FILE}"
  echo "Wrote ${PLUGIN_IMAGE_FILE}"
fi
echo "IMAGE_REF=${IMAGE_REF}"
