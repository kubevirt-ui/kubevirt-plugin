#!/bin/bash
#
# Create IBM Cloud credential secrets for CCO manual mode.
# This replaces ccoctl for environments where the API key doesn't have
# iam.policy.create permission. Uses the same API key for all components.
#
# Required env:
#   IC_API_KEY    IBM Cloud API key
#   INSTALL_DIR   openshift-install working directory (must contain manifests/)

set -euo pipefail

IC_API_KEY="${IC_API_KEY:?IC_API_KEY must be set}"
INSTALL_DIR="${INSTALL_DIR:?INSTALL_DIR must be set}"

MANIFESTS_DIR="${INSTALL_DIR}/openshift"
mkdir -p "${MANIFESTS_DIR}"

CRED_ENV=$(printf "IBMCLOUD_AUTHTYPE=iam\nIBMCLOUD_APIKEY=%s" "${IC_API_KEY}" | base64 -w0)
RAW_KEY=$(printf "%s" "${IC_API_KEY}" | base64 -w0)

NAMESPACES=(
  openshift-cloud-controller-manager
  openshift-machine-api
  openshift-image-registry
  openshift-ingress-operator
  openshift-cluster-csi-drivers
)

# Each secret must be in its own file — the installer ignores multi-document YAML.
# Different operators look for different secret names:
#   ibm-cloud-credentials     — CCM, machine-api
#   ibmcloud-credentials      — machine-api (alternate)
#   installer-cloud-credentials — image-registry
#   cloud-credentials          — ingress-operator (DNS/CIS access)
SECRET_NAMES=(ibm-cloud-credentials ibmcloud-credentials installer-cloud-credentials cloud-credentials)

for ns in "${NAMESPACES[@]}"; do
  for secret_name in "${SECRET_NAMES[@]}"; do
    FILENAME="99-${secret_name}-${ns}.yaml"
    cat > "${MANIFESTS_DIR}/${FILENAME}" <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: ${secret_name}
  namespace: ${ns}
type: Opaque
data:
  ibmcloud_api_key: ${RAW_KEY}
  ibm-credentials.env: ${CRED_ENV}
EOF
    echo "Created ${FILENAME}"
  done
done

echo "All IBM Cloud credential secrets generated in ${MANIFESTS_DIR}/"
