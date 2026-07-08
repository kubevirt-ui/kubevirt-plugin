#!/usr/bin/env bash
set -euo pipefail

export IC_API_KEY
MAX_ATTEMPTS=5

for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
  echo ""
  echo "=========================================="
  echo "  IPI install attempt ${attempt}/${MAX_ATTEMPTS}"
  echo "=========================================="

  if [[ "${attempt}" -gt 1 ]]; then
    echo "Preparing fresh install directory for retry..."
    rm -rf "${INSTALL_DIR}/manifests" "${INSTALL_DIR}/openshift" "${INSTALL_DIR}/.openshift_install"* "${INSTALL_DIR}/auth" "${INSTALL_DIR}/metadata.json" "${INSTALL_DIR}/install.log" "${INSTALL_DIR}/terraform"*
    cp "${INSTALL_DIR}/install-config.yaml.bak" "${INSTALL_DIR}/install-config.yaml"

    echo "Regenerating manifests and CCO secrets..."
    openshift-install create manifests --dir="${INSTALL_DIR}"
    bash ./ci-scripts/hot-cluster/create-ibmcloud-cco-secrets.sh
  else
    openshift-install create manifests --dir="${INSTALL_DIR}"
    bash ./ci-scripts/hot-cluster/create-ibmcloud-cco-secrets.sh
  fi

  echo "Running openshift-install create cluster (90m timeout)..."
  INSTALL_EXIT=0
  timeout 90m openshift-install create cluster --dir="${INSTALL_DIR}" --log-level=info 2>&1 | tee "${INSTALL_DIR}/install.log" || INSTALL_EXIT=$?

  if [[ "${INSTALL_EXIT}" -eq 0 ]]; then
    KUBECONFIG="${INSTALL_DIR}/auth/kubeconfig"
    export KUBECONFIG
    if oc cluster-info &>/dev/null; then
      echo "Cluster created successfully on attempt ${attempt}."
      break
    fi
  fi

  echo "::warning::openshift-install failed on attempt ${attempt}/${MAX_ATTEMPTS}"

  KUBECONFIG="${INSTALL_DIR}/auth/kubeconfig"
  export KUBECONFIG
  if oc cluster-info &>/dev/null && oc get nodes --no-headers 2>/dev/null | grep -q " Ready"; then
    echo "API is up and nodes are Ready. Continuing despite installer errors."
    echo "installer_partial=true" >> "$GITHUB_OUTPUT"
    break
  fi

  if [[ "${attempt}" -eq "${MAX_ATTEMPTS}" ]]; then
    echo "::error::All ${MAX_ATTEMPTS} install attempts failed."
    if [[ -f "${INSTALL_DIR}/metadata.json" ]]; then
      echo "Destroying failed cluster resources..."
      openshift-install destroy cluster --dir="${INSTALL_DIR}" --log-level=info 2>&1 | tail -30 || true
    fi
    exit 1
  fi

  echo "Destroying failed cluster before retry..."
  if [[ -f "${INSTALL_DIR}/metadata.json" ]]; then
    openshift-install destroy cluster --dir="${INSTALL_DIR}" --log-level=info 2>&1 | tail -30 || true
  fi

  echo "Cleaning orphaned COS instances and custom images..."
  ibmcloud resource service-instances --service-name cloud-object-storage --output json 2>/dev/null \
    | jq -r --arg cn "${CLUSTER_NAME}" '.[] | select(.name | startswith($cn)) | .id' \
    | while read -r id; do ibmcloud resource service-instance-delete "${id}" -f --recursive 2>&1 || true; done
  ibmcloud is images --visibility private --output json 2>/dev/null \
    | jq -r --arg cn "${CLUSTER_NAME}" 'if type == "array" then .[] | select(.name | startswith($cn)) | .id else empty end' \
    | while read -r id; do ibmcloud is image-delete "${id}" -f 2>&1 || true; done

  echo "Waiting 60s before retry..."
  sleep 60
done
