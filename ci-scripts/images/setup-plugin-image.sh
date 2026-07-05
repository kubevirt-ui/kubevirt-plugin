#!/bin/bash
#
# OpenShift only: create ImageStream + BuildConfig and run a binary Docker build for the
# kubevirt-plugin image (repo-root Dockerfile).
#
# Output: prints IMAGE_REF= to stdout.
#
# Optional environment variables:
#   NS   Namespace for the build artifacts (default: ci-env-images)
#
# Requires: oc logged into OpenShift.
#
set -euo pipefail
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

source "${REPO_ROOT}/ci-scripts/_cluster-helpers.sh"
verify_oc

NS="${NS:-ci-env-images}"
IMAGE_NAME="kubevirt-plugin"

echo "=== Build kubevirt-plugin image (in-cluster, OpenShift) ==="
echo "  NS:         ${NS}"
echo "  IMAGE_NAME: ${IMAGE_NAME}"
echo "  REPO_ROOT:  ${REPO_ROOT}"
echo ""

oc create namespace "${NS}" --dry-run=client -o yaml | oc apply -f -

echo "Granting cross-namespace image pull access..."
for pull_ns in openshift-cnv manual-console; do
  oc policy add-role-to-group system:image-puller "system:serviceaccounts:${pull_ns}" -n "${NS}" --rolebinding-name="${pull_ns}-image-pullers" 2>/dev/null || true
done

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
    dockerStrategy: {}
  output:
    to:
      kind: ImageStreamTag
      name: ${IMAGE_NAME}:latest
  resources:
    requests:
      cpu: '2'
      memory: 8Gi
    limits:
      cpu: '4'
      memory: 12Gi
  runPolicy: Serial
EOF

echo "Waiting for ImageStream to be resolvable..."
REPO=""
for i in $(seq 1 12); do
  REPO=$(oc get imagestream "${IMAGE_NAME}" -n "${NS}" -o jsonpath='{.status.dockerImageRepository}' 2>/dev/null)
  if [[ -n "${REPO}" ]]; then
    echo "  ImageStream ready: ${REPO}"
    break
  fi
  echo "  Waiting... (${i}/12)"
  sleep 5
done

if [[ -z "${REPO}" ]]; then
  echo "ERROR: ImageStream '${IMAGE_NAME}' did not become resolvable within 60s. Is the internal registry running?"
  oc get configs.imageregistry.operator.openshift.io/cluster -o jsonpath='{.spec.managementState}' 2>/dev/null || true
  exit 1
fi

echo "Starting binary build from ${REPO_ROOT}..."
for attempt in 1 2 3; do
  if oc start-build -n "${NS}" "${IMAGE_NAME}-build" \
       --from-dir="${REPO_ROOT}" \
       --follow; then
    break
  fi
  if [[ "${attempt}" -lt 3 ]]; then
    echo "  Build attempt ${attempt}/3 failed, retrying in 30s..."
    sleep 30
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
echo "IMAGE_REF=${IMAGE_REF}"
