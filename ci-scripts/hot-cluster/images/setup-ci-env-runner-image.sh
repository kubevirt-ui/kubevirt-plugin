#!/bin/bash
#
# OpenShift only: create ImageStream + BuildConfig and run a binary Docker build for the
# ci-env-controller image (ci-scripts/hot-cluster/images/ci-env-runner/Dockerfile).
#
# Output: prints IMAGE_REF= to stdout (and to CI_ENV_CONTROLLER_IMAGE_FILE if set).
#
# Optional environment variables:
#   NS                     Namespace for the controller (default: ci-env)
#   OC_VERSION             OpenShift client version build-arg (default: detect or 4.20)
#   HELM_VERSION           Helm version build-arg (default: 3.19.0)
#   YQ_VERSION             yq version build-arg (default: v4.52.5)
#
# Requires: oc logged into OpenShift; jq optional for version detection and URL resolution.
#
# Binary URL resolution:
#   Uses ci-scripts/_cluster-helpers.sh to resolve cluster resources
#
# Namespace note: If the namespace does not match the ci-env-runner deployment namespace,
# the running service account will need to add role "system:image-puller" so the built image
# can be pulled.
#
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

source "${REPO_ROOT}/ci-scripts/_cluster-helpers.sh"
verify_oc

NS="${NS:-ci-env}"
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

# tar -ch dereferences the ci-env-runner/ directory's symlinks (Helm chart,
# manual-console scripts) so the build pod gets actual files.
# --format=ustar: macOS's bundled bsdtar writes PAX headers by default,
# which OpenShift's build-source extractor rejects outright. ustar is
# supported identically by GNU tar and bsdtar.
echo "Starting binary build from ${IMAGE_DIR} (dereferencing symlinks)..."
for attempt in 1 2 3; do
  if tar --format=ustar -ch -C "${IMAGE_DIR}" . \
       | oc start-build -n "${NS}" "${IMAGE_NAME}-build" \
           --from-archive=- \
           --follow; then
    # `oc start-build --follow` can return exit 0 even when the build
    # actually failed -- verify the real phase via the API. Poll briefly
    # since .status.phase updates a few seconds after the log line appears.
    BUILD_NAME="$(oc get builds -n "${NS}" -l "buildconfig=${IMAGE_NAME}-build" \
      --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[-1:].metadata.name}' 2>/dev/null)"
    BUILD_PHASE="Unknown"
    for _ in $(seq 1 12); do
      BUILD_PHASE="$(oc get build "${BUILD_NAME}" -n "${NS}" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")"
      [[ "${BUILD_PHASE}" == "Complete" || "${BUILD_PHASE}" == "Failed" || "${BUILD_PHASE}" == "Error" ]] && break
      sleep 5
    done
    if [[ "${BUILD_PHASE}" == "Complete" ]]; then
      break
    fi
    echo "  oc start-build reported success but build ${BUILD_NAME} is actually '${BUILD_PHASE}'"
  fi
  if [[ "${attempt}" -lt 3 ]]; then
    echo "  Build attempt ${attempt}/3 failed, retrying in 15s..."
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

# TODO: Better handling of passing the fqdn image name to the caller
if [[ -n "${CI_ENV_RUNNER_IMAGE_FILE:-}" ]]; then
  printf '%s\n' "${IMAGE_REF}" > "${CI_ENV_RUNNER_IMAGE_FILE}"
  echo "Wrote ${CI_ENV_RUNNER_IMAGE_FILE}"
fi
echo "IMAGE_REF=${IMAGE_REF}"
