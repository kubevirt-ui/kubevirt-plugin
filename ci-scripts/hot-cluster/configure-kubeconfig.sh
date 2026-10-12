#!/usr/bin/env bash
set -euo pipefail

if [[ "${INFRASTRUCTURE_TYPE}" == "ipi" ]]; then
  INSTALL_DIR="${RUNNER_TEMP}/ipi-install"
  KUBECONFIG_PATH="${INSTALL_DIR}/auth/kubeconfig"

  echo "Looking for kubeconfig at ${KUBECONFIG_PATH}..."
  ls -la "${INSTALL_DIR}/auth/" 2>/dev/null || echo "auth dir not found"

  if [[ ! -f "${KUBECONFIG_PATH}" ]]; then
    echo "::error::kubeconfig not found at ${KUBECONFIG_PATH}"
    exit 1
  fi

  export KUBECONFIG="${KUBECONFIG_PATH}"
  echo "KUBECONFIG=${KUBECONFIG_PATH}" >> "$GITHUB_ENV"

  echo "Waiting for API DNS to resolve (up to 10 minutes)..."
  API_HOST="api.${CLUSTER_NAME}.${BASE_DOMAIN}"
  for i in $(seq 1 20); do
    if dig +short "${API_HOST}" 2>/dev/null | grep -q .; then
      echo "  DNS resolved for ${API_HOST}"
      break
    fi
    if [[ "${i}" -eq 20 ]]; then
      echo "::error::DNS for ${API_HOST} did not resolve within 10 minutes"
      dig "${API_HOST}" 2>/dev/null || true
      exit 1
    fi
    echo "  Waiting for DNS resolution... (${i}/20)"
    sleep 30
  done
else
  ibmcloud oc cluster config --cluster "${CLUSTER_NAME}" --admin
fi

echo "Verifying cluster connectivity..."
for i in $(seq 1 6); do
  if oc cluster-info 2>/dev/null; then
    break
  fi
  if [[ "${i}" -eq 6 ]]; then
    echo "::error::Could not connect to cluster after DNS resolved"
    oc cluster-info 2>&1 || true
    exit 1
  fi
  echo "  Retrying cluster connection... (${i}/6)"
  sleep 10
done
oc get nodes -o wide
