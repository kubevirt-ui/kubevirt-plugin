#!/bin/bash
#
# Install OpenShift Virtualization (CNV) — the productized operator from Red Hat's
# catalog.  This replaces the previous community HCO installation and uses the
# standard `openshift-cnv` namespace, `redhat-operators` CatalogSource, and
# includes nmstate as a bundled operand.
#
# Environment variables (all have defaults):
#   KVM_EMULATION          - "true" or "false" (default: "true", only bare metal nodes have real KVM)
#   CNV_CHANNEL            - OLM subscription channel (default: "stable")
#   HCO_CR_PATH            - Path to HCO CR yaml (default: playwright/fixtures/hco.yaml)
#   SKIP_HPP               - Set to "true" to skip HPP installation
#   HPP_VERSION            - HostPath Provisioner release branch
#
set -euo pipefail

export KVM_EMULATION="${KVM_EMULATION:-true}"
export CNV_CHANNEL="${CNV_CHANNEL:-stable}"
HCO_CR_PATH="${HCO_CR_PATH:-playwright/fixtures/hco.yaml}"
SKIP_HPP="${SKIP_HPP:-false}"
HPP_VERSION="${HPP_VERSION:-release-v0.21}"

CNV_NS="openshift-cnv"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "=== OpenShift Virtualization (CNV) Installation ==="
echo "  KVM_EMULATION: ${KVM_EMULATION}"
echo "  CNV_CHANNEL:   ${CNV_CHANNEL}"
echo "  CNV_NS:        ${CNV_NS}"
echo "  SKIP_HPP:      ${SKIP_HPP}"
echo ""

# --- Namespace + OperatorGroup + Subscription ---
echo "Creating CNV Namespace, OperatorGroup, and Subscription..."
oc apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: ${CNV_NS}
---
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: kubevirt-hyperconverged-group
  namespace: ${CNV_NS}
spec:
  targetNamespaces:
    - ${CNV_NS}
---
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: hco-operatorhub
  namespace: ${CNV_NS}
spec:
  source: redhat-operators
  sourceNamespace: openshift-marketplace
  name: kubevirt-hyperconverged
  channel: "${CNV_CHANNEL}"
  installPlanApproval: Automatic
  config:
    env:
    - name: KVM_EMULATION
      value: "${KVM_EMULATION}"
EOF

echo "Waiting for Subscription to have an InstallPlan..."
for i in $(seq 1 120); do
  INSTALL_PLAN="$(oc get subscription hco-operatorhub -n ${CNV_NS} \
    -o jsonpath='{.status.installPlanRef.name}' 2>/dev/null || true)"
  if [[ -n "${INSTALL_PLAN}" ]]; then
    echo "InstallPlan found: ${INSTALL_PLAN}"
    break
  fi
  if [[ "${i}" -eq 120 ]]; then
    echo "ERROR: Timed out waiting for CNV InstallPlan"
    exit 1
  fi
  echo "Waiting for InstallPlan... (${i}/120)"
  sleep 5
done

# --- Wait for HCO operator deployment ---
echo "Waiting for HCO operator deployment to be created..."
for i in $(seq 1 60); do
  # Note: `|| true` (not `|| echo "0"`) — with `pipefail`, a failing `oc get`
  # (e.g. resource not found, which is expected while polling) makes the
  # pipeline's exit status non-zero even though `wc -l` already succeeded and
  # printed "0"; `|| echo "0"` would then append a second "0" line, breaking
  # the numeric comparison below.
  HCO_DEPLOY=$(oc get deployment hco-operator -n ${CNV_NS} --no-headers 2>/dev/null | wc -l || true)
  if [[ "${HCO_DEPLOY}" -gt 0 ]]; then
    echo "HCO operator deployment found"
    break
  fi
  if [[ "${i}" -eq 60 ]]; then
    echo "ERROR: Timed out waiting for HCO operator deployment"
    exit 1
  fi
  echo "Waiting for HCO operator deployment... (${i}/60)"
  sleep 10
done

echo "Waiting for HCO operator to become available..."
oc wait deployment hco-operator \
  --namespace=${CNV_NS} \
  --for=condition=Available \
  --timeout=15m

# --- Apply HCO CR with retries ---
echo "Creating HCO CR..."
hco_cr_is_created="false"

for i in $(seq 1 20); do
  echo "Attempt ${i}/20"
  if oc apply -f "${REPO_ROOT}/${HCO_CR_PATH}" -n ${CNV_NS}; then
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
oc wait -n ${CNV_NS} hyperconverged kubevirt-hyperconverged \
  --for=condition=Available \
  --timeout=15m

# --- Wait for operands to be fully ready ---
echo "Waiting for CNV operands to finish deploying..."

echo "  Waiting for SSP to be available..."
oc wait ssp -n ${CNV_NS} --all --for=condition=Available --timeout=10m

echo "  Waiting for NetworkAttachmentDefinition CRD (nmstate)..."
for i in $(seq 1 60); do
  if oc get crd networkattachmentdefinitions.k8s.cni.cncf.io &>/dev/null; then
    echo "  NAD CRD is registered"
    break
  fi
  if [[ "${i}" -eq 60 ]]; then
    echo "  WARNING: NAD CRD not found after 10 minutes (nmstate may not be installed)"
  fi
  sleep 10
done

echo "  Waiting for common templates to be created..."
for i in $(seq 1 60); do
  TPL_COUNT=$(oc get templates -n openshift --no-headers 2>/dev/null | wc -l | tr -d ' ')
  if [[ "${TPL_COUNT}" -gt 0 ]]; then
    echo "  Found ${TPL_COUNT} common templates"
    break
  fi
  if [[ "${i}" -eq 60 ]]; then
    echo "  WARNING: No common templates found after 10 minutes"
  fi
  sleep 10
done

echo "  Waiting for DataSources in os-images namespace..."
for i in $(seq 1 90); do
  DS_COUNT=$(oc get datasource -n openshift-virtualization-os-images --no-headers 2>/dev/null | wc -l | tr -d ' ')
  if [[ "${DS_COUNT}" -gt 0 ]]; then
    echo "  Found ${DS_COUNT} DataSources in openshift-virtualization-os-images"
    break
  fi
  if [[ "${i}" -eq 90 ]]; then
    echo "  WARNING: No DataSources found after 15 minutes (DataImportCrons may still be importing)"
  fi
  sleep 10
done

echo "CNV operands are ready."

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
echo "=== OpenShift Virtualization Installation Complete ==="
echo "  Namespace: ${CNV_NS}"
echo "  Channel:   ${CNV_CHANNEL}"
echo "  nmstate:   bundled (installed as CNV operand)"
