#!/bin/bash
#
# Install HCO (HyperConverged Cluster Operator) and dependencies to the current oc
# logged in cluster.  Based on the `deploy-kubevirt-gating.sh` script.
#
# Environment variables (all have defaults):
#   KVM_EMULATION          - "true" or "false" (default: "true", only bare metal compute nodes have real KVM)
#   HCO_IMAGE_VER          - HCO catalog image version
#   HCO_SUBSCRIPTION_CHANNEL - OLM subscription channel
#   HPP_VERSION            - HostPath Provisioner release branch
#   HCO_CR_PATH            - Path to HCO CR yaml (default: playwright/fixtures/hco.yaml)
#   SKIP_HPP               - Set to "true" to skip HPP installation
#
set -euo pipefail

#
# TODO: We can query details about the cluster and use that to determine the HCO version,
#       KVM_EMULATION, and HPP_VERSION to use for the installation.  For now, we're using
#       defaults from the prow ci configuration.
#

export KVM_EMULATION="${KVM_EMULATION:-true}"
export HCO_IMAGE_VER="${HCO_IMAGE_VER:-1.19.0-unstable}"
export HCO_SUBSCRIPTION_CHANNEL="${HCO_SUBSCRIPTION_CHANNEL:-candidate-v1.19}"
export HPP_VERSION="${HPP_VERSION:-release-v0.21}"
HCO_CR_PATH="${HCO_CR_PATH:-playwright/fixtures/hco.yaml}"
SKIP_HPP="${SKIP_HPP:-false}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=== HCO Installation ==="
echo "  KVM_EMULATION:            ${KVM_EMULATION}"
echo "  HCO_IMAGE_VER:            ${HCO_IMAGE_VER}"
echo "  HCO_SUBSCRIPTION_CHANNEL: ${HCO_SUBSCRIPTION_CHANNEL}"
echo "  HPP_VERSION:              ${HPP_VERSION}"
echo "  SKIP_HPP:                 ${SKIP_HPP}"
echo ""

# --- CatalogSource ---
echo "Creating HCO CatalogSource..."
oc apply -f - <<EOF
apiVersion: operators.coreos.com/v1alpha1
kind: CatalogSource
metadata:
  name: hco-unstable-catalog-source
  namespace: openshift-marketplace
spec:
  sourceType: grpc
  image: quay.io/kubevirt/hyperconverged-cluster-index:${HCO_IMAGE_VER}
  displayName: Kubevirt Hyperconverged Cluster Operator
  publisher: Kubevirt Project
EOF

# --- Namespace, OperatorGroup, Subscription ---
echo "Creating HCO Namespace, OperatorGroup, and Subscription..."
oc apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: kubevirt-hyperconverged
---
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: kubevirt-hyperconverged-group
  namespace: kubevirt-hyperconverged
---
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: hco-operatorhub
  namespace: kubevirt-hyperconverged
spec:
  source: hco-unstable-catalog-source
  sourceNamespace: openshift-marketplace
  name: community-kubevirt-hyperconverged
  channel: "${HCO_SUBSCRIPTION_CHANNEL}"
  config:
    selector:
      matchLabels:
        name: hyperconverged-cluster-operator
    env:
    - name: KVM_EMULATION
      value: "${KVM_EMULATION}"
EOF

echo "Waiting for CatalogSource to be ready..."
for i in $(seq 1 60); do
  CS_STATE=$(oc get catalogsource hco-unstable-catalog-source -n openshift-marketplace \
    -o jsonpath='{.status.connectionState.lastObservedState}' 2>/dev/null || echo "")
  if [[ "${CS_STATE}" == "READY" ]]; then
    echo "CatalogSource is ready"
    break
  fi
  echo "CatalogSource state: ${CS_STATE:-pending} (${i}/60)"
  sleep 10
done

echo "Waiting for Subscription to have an InstallPlan..."
for i in $(seq 1 120); do
  INSTALL_PLAN="$(oc get subscription hco-operatorhub -n kubevirt-hyperconverged \
    -o jsonpath='{.status.installPlanRef.name}' 2>/dev/null || true)"
  if [[ -n "${INSTALL_PLAN}" ]]; then
    echo "InstallPlan found: ${INSTALL_PLAN}"
    break
  fi
  if [[ "${i}" -eq 120 ]]; then
    echo "ERROR: Timed out waiting for HCO InstallPlan"
    exit 1
  fi
  echo "Waiting for InstallPlan... (${i}/60)"
  sleep 5
done

# --- Wait for HCO deployments to appear ---
echo "Waiting for HCO operator deployment to be created..."
for i in $(seq 1 60); do
  DEPLOY_COUNT=$(oc get deployments -n kubevirt-hyperconverged \
    --selector="operators.coreos.com/community-kubevirt-hyperconverged.kubevirt-hyperconverged" \
    --no-headers 2>/dev/null | wc -l)
  if [[ "${DEPLOY_COUNT}" -gt 0 ]]; then
    echo "HCO deployment found (${DEPLOY_COUNT} deployment(s))"
    break
  fi
  if [[ "${i}" -eq 60 ]]; then
    echo "ERROR: Timed out waiting for HCO deployment to be created"
    exit 1
  fi
  echo "Waiting for HCO deployment... (${i}/60)"
  sleep 10
done

echo "Waiting for HCO deployments to become available..."
oc wait deployments \
  --selector="operators.coreos.com/community-kubevirt-hyperconverged.kubevirt-hyperconverged" \
  --namespace=kubevirt-hyperconverged \
  --for=condition=Available \
  --timeout=15m

# --- Apply HCO CR with retries ---
echo "Creating HCO CR..."
hco_cr_is_created="false"

for i in $(seq 1 20); do
  echo "Attempt ${i}/20"
  if oc apply -f "${REPO_ROOT}/${HCO_CR_PATH}"; then
    echo "HCO CR created successfully"
    hco_cr_is_created="true"
    break
  fi
  sleep 30
done

if [[ "${hco_cr_is_created}" == "false" ]]; then
  echo "ERROR: HCO CR could not be created after 20 attempts"
  exit 1
fi

# --- Wait for HCO to be available ---
echo "Waiting for HCO to report Available..."
oc wait -n kubevirt-hyperconverged hyperconverged kubevirt-hyperconverged \
  --for=condition=Available \
  --timeout=15m

# --- HPP (optional) ---
if [[ "${SKIP_HPP}" != "true" ]]; then
  echo "Installing HostPath Provisioner..."

  HPP_BASE="https://raw.githubusercontent.com/kubevirt/hostpath-provisioner-operator/${HPP_VERSION}/deploy"
  for manifest in hostpathprovisioner_cr.yaml storageclass-wffc-csi.yaml; do
    for attempt in 1 2 3; do
      if oc apply -f "${HPP_BASE}/${manifest}"; then
        break
      fi
      echo "  Retry ${attempt}/3 for ${manifest} (GitHub raw CDN may be flaky)..."
      sleep 10
    done
  done

  for sc in $(oc get storageclasses -o jsonpath='{.items[*].metadata.name}'); do
    if [[ "${sc}" != "hostpath-csi" ]]; then
      oc annotate storageclass "${sc}" storageclass.kubernetes.io/is-default-class='false' --overwrite || true
    fi
  done
  oc annotate storageclass hostpath-csi storageclass.kubernetes.io/is-default-class='true' --overwrite

  echo "HPP installation complete"
else
  echo "Skipping HPP installation (SKIP_HPP=true)"
fi

echo ""
echo "=== HCO Installation Complete ==="
