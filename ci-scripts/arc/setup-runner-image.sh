#!/bin/bash
#
# OpenShift only: create ImageStream + BuildConfig and run a binary Docker build for the
# custom ARC runner image (ci-scripts/arc/runner-image/Dockerfile).
#
# Output: prints IMAGE_REF= to stdout (and to ARC_RUNNER_IMAGE_FILE if set).
# Run setup-dind-mirror.sh first if you need an internal docker:dind mirror (optional).
#
# Optional environment variables:
#   ARC_RUNNERS_NS   (default: arc-runners)
#   OC_VERSION       OpenShift client version build-arg (default: detect or 4.20)
#   VIRTCTL_VERSION  (default: v1.4.0)
#
# Requires: oc logged into OpenShift; jq optional for version detection and URL resolution.
#
# Binary URL resolution:
#   When jq is available, this script queries ConsoleCLIDownload resources to find the
#   exact binary download URLs for oc, kubectl, and virtctl that match the live cluster.
#   These are passed to the Docker build as OC_URL, KUBECTL_URL, and VIRTCTL_URL build-args.
#   If resolution fails (CRD not found, jq absent, etc.), the Dockerfile falls back to
#   mirror.openshift.com / dl.k8s.io / GitHub releases using OC_VERSION / VIRTCTL_VERSION.

set -euo pipefail
ARC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_SCRIPTS_DIR="$(cd "${ARC_DIR}/.." && pwd)"
source "${CI_SCRIPTS_DIR}/ci-tools.sh"

ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
RUNNER_IMAGE_DIR="${ARC_DIR}/runner-image"

ensure_oc

if ! oc get clusterversion version &>/dev/null; then
  echo "ERROR: OpenShift cluster required (clusterversion.version not found)."
  exit 1
fi

if [[ -z "${OC_VERSION:-}" ]]; then
  OC_VERSION=$(oc version --output json 2>/dev/null | jq -r '.openshiftVersion | split(".") | .[0:2] | join(".") // empty') || true
  OC_VERSION="${OC_VERSION:-4.20}"
fi
VIRTCTL_VERSION="${VIRTCTL_VERSION:-v1.4.0}"

# Resolve binary download URLs from ConsoleCLIDownload resources so the image binaries
# match the live cluster exactly. Requires jq; silently skipped if unavailable.
OC_URL=""
KUBECTL_URL=""
VIRTCTL_URL=""
if command -v jq &>/dev/null; then
  CLI_DOWNLOAD_JSON=$(oc get consoleclidownload -o json 2>/dev/null || true)
  if [[ -n "${CLI_DOWNLOAD_JSON}" ]]; then
    OC_URL=$(echo "${CLI_DOWNLOAD_JSON}" \
      | jq -r '.items[].spec.links[] | select(.text | test("oc.*linux.*x86_64|oc.*linux.*amd64"; "i")) | .href' \
      | head -1)
    KUBECTL_URL=$(echo "${CLI_DOWNLOAD_JSON}" \
      | jq -r '.items[].spec.links[] | select(.text | test("kubectl.*linux.*x86_64|kubectl.*linux.*amd64"; "i")) | .href' \
      | head -1)
    VIRTCTL_URL=$(echo "${CLI_DOWNLOAD_JSON}" \
      | jq -r '.items[].spec.links[] | select(.text | test("virtctl.*linux.*amd64|virtctl.*linux.*x86_64"; "i")) | .href' \
      | head -1 || true)

    # Rewrite public console download route URLs to their backing internal HTTP services so
    # that build pods don't need to trust the cluster's self-signed ingress CA.
    # Each route's host maps to a service that listens on plain HTTP internally; TLS is only
    # terminated at the ingress router. We resolve service+namespace from the route spec so
    # this works for any URL regardless of hostname naming conventions.
    _ALL_ROUTES_JSON=$(oc get route --all-namespaces -o json 2>/dev/null || true)
    _url_to_internal() {
      local url="${1}"
      local host path route_info ns svc svc_port
      host=$(echo "${url}" | sed -E 's|https://([^/]+).*|\1|')
      path=$(echo "${url}" | sed -E 's|https://[^/]+(/.*)|\1|')
      route_info=$(echo "${_ALL_ROUTES_JSON}" \
        | jq -r --arg h "${host}" \
            '.items[] | select(.spec.host == $h) | "\(.metadata.namespace) \(.spec.to.name)"' \
        | head -1)
      if [[ -n "${route_info}" ]]; then
        read -r ns svc <<< "${route_info}"
        svc_port=$(oc get service "${svc}" -n "${ns}" \
          -o jsonpath='{.spec.ports[0].port}' 2>/dev/null || echo "8080")
        echo "http://${svc}.${ns}.svc.cluster.local:${svc_port}${path}"
      else
        echo "${url}"
      fi
    }
    [[ -n "${OC_URL}" ]]      && OC_URL=$(_url_to_internal "${OC_URL}")
    [[ -n "${KUBECTL_URL}" ]] && KUBECTL_URL=$(_url_to_internal "${KUBECTL_URL}")
    [[ -n "${VIRTCTL_URL}" ]] && VIRTCTL_URL=$(_url_to_internal "${VIRTCTL_URL}")
  fi
fi

echo "=== Build ARC runner image (in-cluster, OpenShift) ==="
echo "  ARC_RUNNERS_NS:   ${ARC_RUNNERS_NS}"
echo "  OC_VERSION:       ${OC_VERSION}"
echo "  VIRTCTL_VERSION:  ${VIRTCTL_VERSION}"
echo "  RUNNER_IMAGE_DIR: ${RUNNER_IMAGE_DIR}"
echo "  OC_URL:           ${OC_URL:-(fallback to mirror.openshift.com)}"
echo "  KUBECTL_URL:      ${KUBECTL_URL:-(fallback to dl.k8s.io)}"
echo "  VIRTCTL_URL:      ${VIRTCTL_URL:-(fallback to GitHub releases)}"
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
        - name: OC_URL
          value: "${OC_URL}"
        - name: KUBECTL_URL
          value: "${KUBECTL_URL}"
        - name: VIRTCTL_URL
          value: "${VIRTCTL_URL}"
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
