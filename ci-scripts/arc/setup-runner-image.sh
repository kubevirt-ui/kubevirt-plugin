#!/bin/bash
#
# OpenShift only: create ImageStream + BuildConfig and run a binary Docker build for the
# custom ARC runner image (ci-scripts/arc/runner-image/Dockerfile).
#
# Output: prints IMAGE_REF= to stdout (and to ARC_RUNNER_IMAGE_FILE if set).
#
# Optional environment variables:
#   ARC_RUNNERS_NS   (default: arc-runners)
#   OC_VERSION       OpenShift client version build-arg (default: detect or 4.20)
#   HELM_VERSION     Helm version build-arg (default: 3.19.0)
#   VIRTCTL_VERSION  (default: v1.4.0)
#
# Requires: oc logged into OpenShift; jq optional for version detection and URL resolution.
#
# Binary URL resolution:
#   Uses ci-scripts/_cluster-helpers.sh to query ConsoleCLIDownload resources for
#   exact binary download URLs (oc, virtctl, helm) matching the live cluster.
#   These are passed to the Docker build as OC_URL, VIRTCTL_URL, and HELM_URL build-args.
#   If resolution fails (CRD not found, jq absent, etc.), the Dockerfile falls back to
#   mirror.openshift.com / GitHub releases / get.helm.sh using OC_VERSION / VIRTCTL_VERSION /
#   HELM_VERSION.

set -euo pipefail
ARC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_SCRIPTS_DIR="$(cd "${ARC_DIR}/.." && pwd)"

ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
RUNNER_IMAGE_DIR="${ARC_DIR}/runner-image"

if ! oc get clusterversion version &>/dev/null; then
  echo "ERROR: OpenShift cluster required (clusterversion.version not found)."
  exit 1
fi

source "${CI_SCRIPTS_DIR}/_cluster-helpers.sh"

resolve_oc_version
HELM_VERSION="${HELM_VERSION:-3.19.0}"
VIRTCTL_VERSION="${VIRTCTL_VERSION:-v1.4.0}"

resolve_cli_downloads

echo "=== Build ARC runner image (in-cluster, OpenShift) ==="
echo "  ARC_RUNNERS_NS:   ${ARC_RUNNERS_NS}"
echo "  OC_VERSION:       ${OC_VERSION}"
echo "  VIRTCTL_VERSION:  ${VIRTCTL_VERSION}"
echo "  HELM_VERSION:     ${HELM_VERSION}"
echo "  RUNNER_IMAGE_DIR: ${RUNNER_IMAGE_DIR}"
echo "  OC_URL:           ${OC_URL:-(fallback to mirror.openshift.com)}"
echo "  VIRTCTL_URL:      ${VIRTCTL_URL:-(fallback to GitHub releases)}"
echo "  HELM_URL:         ${HELM_URL:-(fallback to get.helm.sh)}"
echo ""

if [[ ! -f "${RUNNER_IMAGE_DIR}/Dockerfile" ]]; then
  echo "ERROR: Dockerfile not found at ${RUNNER_IMAGE_DIR}/Dockerfile"
  exit 1
fi

oc create namespace "${ARC_RUNNERS_NS}" --dry-run=client -o yaml | oc apply -f -

oc apply -f - <<EOF
apiVersion: image.openshift.io/v1
kind: ImageStream
metadata:
  name: arc-runner-custom
  namespace: ${ARC_RUNNERS_NS}
spec:
  lookupPolicy:
    local: true
EOF

oc apply -f - <<EOF
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: arc-runner-custom
  namespace: ${ARC_RUNNERS_NS}
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
        - name: VIRTCTL_VERSION
          value: "${VIRTCTL_VERSION}"
        - name: HELM_VERSION
          value: "${HELM_VERSION}"
        - name: OC_URL
          value: "${OC_URL}"
        - name: VIRTCTL_URL
          value: "${VIRTCTL_URL}"
        - name: HELM_URL
          value: "${HELM_URL}"
  output:
    to:
      kind: ImageStreamTag
      name: arc-runner-custom:latest
  runPolicy: Serial
EOF

echo "Starting binary build from ${RUNNER_IMAGE_DIR}..."
oc start-build -n "${ARC_RUNNERS_NS}" arc-runner-custom \
  --from-dir="${RUNNER_IMAGE_DIR}" \
  --follow

IMAGE_REF="image-registry.openshift-image-registry.svc:5000/${ARC_RUNNERS_NS}/arc-runner-custom:latest"
echo ""
echo "=== Build complete ==="
echo "Image: ${IMAGE_REF}"
if [[ -n "${ARC_RUNNER_IMAGE_FILE:-}" ]]; then
  printf '%s\n' "${IMAGE_REF}" > "${ARC_RUNNER_IMAGE_FILE}"
  echo "Wrote ${ARC_RUNNER_IMAGE_FILE}"
fi

echo "IMAGE_REF=${IMAGE_REF}"
