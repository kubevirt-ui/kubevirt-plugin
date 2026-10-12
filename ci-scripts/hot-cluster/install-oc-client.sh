#!/bin/bash
#
# Install the OpenShift oc client from mirror.openshift.com (verified TLS).
# Use in GitHub Actions before kubeconfig is available, or after ibmcloud cluster get.
#
# Environment variables:
#   OPENSHIFT_VERSION  - Major.minor (e.g. 4.20). If unset, derived from CLUSTER_JSON.
#   CLUSTER_JSON       - JSON from: ibmcloud oc cluster get --cluster NAME --output json
#   OC_INSTALL_DIR     - Target directory (default: /usr/local/bin)
#
set -euo pipefail

OC_INSTALL_DIR="${OC_INSTALL_DIR:-/usr/local/bin}"

resolve_version_from_json() {
  local json="${1:-}"
  if [[ -z "${json}" ]]; then
    return 1
  fi
  echo "${json}" | jq -r '
    (
      .masterKubeVersion //
      .openshiftVersion //
      .version //
      ""
    )
    | if . == "" then empty
      else split(".") | .[0:2] | join(".")
      end
  ' 2>/dev/null || true
}

if [[ -z "${OPENSHIFT_VERSION:-}" ]]; then
  if [[ -n "${CLUSTER_JSON:-}" ]]; then
    OPENSHIFT_VERSION="$(resolve_version_from_json "${CLUSTER_JSON}")"
  fi
fi

OPENSHIFT_VERSION="${OPENSHIFT_VERSION:-4.20}"
echo "Installing oc client for OpenShift ${OPENSHIFT_VERSION}..."

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

ARCHIVE="${TMP_DIR}/openshift-client-linux.tar.gz"
URL="https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable-${OPENSHIFT_VERSION}/openshift-client-linux.tar.gz"

if ! curl -fsSL -o "${ARCHIVE}" "${URL}"; then
  echo "::error::Failed to download oc from ${URL}"
  exit 1
fi

tar -xzf "${ARCHIVE}" -C "${TMP_DIR}"
install -m 0755 "${TMP_DIR}/oc" "${OC_INSTALL_DIR}/oc"

echo "Installed: $("${OC_INSTALL_DIR}/oc" version --client)"
