#!/bin/bash
#
# Installs OpenShift Virtualization (CNV) from Red Hat's redhat-operators
# catalog into openshift-cnv, with nmstate bundled as an operand.
#
# Environment variables (all have defaults):
#   KVM_EMULATION          - "true" or "false" (only bare metal nodes have real KVM)
#   CNV_CHANNEL            - OLM subscription channel (default: "stable")
#   CNV_PIN_VERSION        - "<major>.<minor>" to pin CNV to the newest matching CSV
#                            within CNV_CHANNEL via startingCSV (default: unpinned).
#                            Resolved dynamically against the live PackageManifest;
#                            no matching CSV is a hard failure, not a silent fallback
#                            to the channel head. Only takes effect at Subscription
#                            creation time -- can't re-pin an already-installed cluster.
#   HCO_CR_PATH            - Path to HCO CR yaml (default: playwright/fixtures/hco.yaml)
#   SKIP_HPP               - Set to "true" to skip HPP installation
#   HPP_VERSION            - HostPath Provisioner release branch
#
set -euo pipefail

export KVM_EMULATION="${KVM_EMULATION:-true}"
export CNV_CHANNEL="${CNV_CHANNEL:-stable}"
CNV_PIN_VERSION="${CNV_PIN_VERSION:-}"
HCO_CR_PATH="${HCO_CR_PATH:-playwright/fixtures/hco.yaml}"
SKIP_HPP="${SKIP_HPP:-false}"
HPP_VERSION="${HPP_VERSION:-release-v0.21}"

CNV_NS="openshift-cnv"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "=== OpenShift Virtualization (CNV) Installation ==="
echo "  KVM_EMULATION:   ${KVM_EMULATION}"
echo "  CNV_CHANNEL:     ${CNV_CHANNEL}"
echo "  CNV_PIN_VERSION: ${CNV_PIN_VERSION:-<none, unpinned>}"
echo "  CNV_NS:          ${CNV_NS}"
echo "  SKIP_HPP:        ${SKIP_HPP}"
echo ""

# --- Namespace + OperatorGroup ---
echo "Creating CNV Namespace and OperatorGroup..."
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
EOF

# --- Resolve a pinned startingCSV, if requested ---
STARTING_CSV=""
INSTALL_PLAN_APPROVAL="Automatic"

if [[ -n "${CNV_PIN_VERSION}" ]]; then
  if [[ ! "${CNV_PIN_VERSION}" =~ ^[0-9]+\.[0-9]+$ ]]; then
    echo "ERROR: CNV_PIN_VERSION='${CNV_PIN_VERSION}' is not a valid \"<major>.<minor>\" version (e.g. \"4.20\")."
    exit 1
  fi

  echo "Resolving pinned CSV for CNV_PIN_VERSION=${CNV_PIN_VERSION} from channel '${CNV_CHANNEL}'..."
  # Filters by catalogSource explicitly since PackageManifest names aren't
  # guaranteed unique across sources. Retried since a transient `oc get`
  # failure would otherwise trip `set -e`; a genuine "no match" still
  # exits 0, so this only retries real command failures.
  for attempt in 1 2 3; do
    if STARTING_CSV="$(oc get packagemanifest -n openshift-marketplace -o json 2>/dev/null \
      | jq -r --arg ch "${CNV_CHANNEL}" --arg ver "${CNV_PIN_VERSION}." \
        '.items[]? | select(.metadata.name == "kubevirt-hyperconverged" and .status.catalogSource == "redhat-operators") | .status.channels[]? | select(.name == $ch) | .entries[]? | select((.version // "") | startswith($ver)) | "\(.version) \(.name)"' \
      | sort -V | tail -1 | awk '{print $2}')"; then
      break
    fi
    echo "  Retry ${attempt}/3 for packagemanifest lookup (API may be transiently unavailable)..."
    sleep 10
  done

  if [[ -z "${STARTING_CSV}" ]]; then
    echo "ERROR: No CSV matching version prefix '${CNV_PIN_VERSION}.' found in channel '${CNV_CHANNEL}' (redhat-operators)."
    echo "This is a hard failure rather than a silent fallback to the latest channel head. To deliberately install unpinned, override cnv_channel explicitly on the workflow dispatch."
    exit 1
  fi

  echo "Resolved pinned CSV: ${STARTING_CSV}"
  INSTALL_PLAN_APPROVAL="Manual"
fi

# --- Subscription ---
# installPlanApproval stays Manual when pinned, so a later upgrade
# InstallPlan is left pending instead of moving the cluster off STARTING_CSV.
SUBSCRIPTION_YAML="apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: hco-operatorhub
  namespace: ${CNV_NS}
spec:
  source: redhat-operators
  sourceNamespace: openshift-marketplace
  name: kubevirt-hyperconverged
  channel: \"${CNV_CHANNEL}\"
  installPlanApproval: ${INSTALL_PLAN_APPROVAL}"

if [[ -n "${STARTING_CSV}" ]]; then
  SUBSCRIPTION_YAML="${SUBSCRIPTION_YAML}
  startingCSV: \"${STARTING_CSV}\""
fi

SUBSCRIPTION_YAML="${SUBSCRIPTION_YAML}
  config:
    env:
    - name: KVM_EMULATION
      value: \"${KVM_EMULATION}\""

echo "Creating CNV Subscription..."
oc apply -f - <<EOF
${SUBSCRIPTION_YAML}
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

if [[ "${INSTALL_PLAN_APPROVAL}" == "Manual" ]]; then
  # Guard against approving the wrong plan if this script is ever re-run
  # against an already-provisioned Subscription that has since advanced to
  # a later upgrade InstallPlan.
  PLAN_CSVS="$(oc get installplan "${INSTALL_PLAN}" -n ${CNV_NS} -o jsonpath='{.spec.clusterServiceVersionNames[*]}' 2>/dev/null || true)"
  if [[ " ${PLAN_CSVS} " != *" ${STARTING_CSV} "* ]]; then
    echo "ERROR: InstallPlan ${INSTALL_PLAN} does not target the pinned CSV ${STARTING_CSV} (it targets: ${PLAN_CSVS:-<none>})."
    echo "Refusing to approve it -- investigate manually (a stale Subscription from a prior run is the most likely cause)."
    exit 1
  fi

  echo "Approving the initial InstallPlan (${INSTALL_PLAN}) for pinned CSV ${STARTING_CSV}..."
  oc patch installplan "${INSTALL_PLAN}" -n ${CNV_NS} --type merge -p '{"spec":{"approved":true}}'
fi

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "starting_csv=${STARTING_CSV}" >> "$GITHUB_OUTPUT"
fi

# --- Wait for HCO operator deployment ---
echo "Waiting for HCO operator deployment to be created..."
for i in $(seq 1 60); do
  # `|| true` (not `|| echo "0"`): with pipefail, a failing `oc get` makes
  # the pipeline exit non-zero even though `wc -l` already printed "0".
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

# --- Confirm the installed CSV actually matches the pin, if requested ---
# Belt-and-suspenders: confirms what's actually running, not just approved.
if [[ -n "${STARTING_CSV}" ]]; then
  ACTUAL_CSV="$(oc get subscription hco-operatorhub -n ${CNV_NS} -o jsonpath='{.status.currentCSV}' 2>/dev/null || true)"
  if [[ "${ACTUAL_CSV}" != "${STARTING_CSV}" ]]; then
    echo "ERROR: Installed CSV '${ACTUAL_CSV:-<none>}' does not match pinned CSV '${STARTING_CSV}' -- the cluster is not running the expected CNV version."
    exit 1
  fi
  echo "Confirmed installed CSV matches pin: ${ACTUAL_CSV}"
fi

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
echo "  Namespace:   ${CNV_NS}"
echo "  Channel:     ${CNV_CHANNEL}"
if [[ -n "${STARTING_CSV}" ]]; then
  echo "  Pinned CSV:  ${STARTING_CSV} (installPlanApproval: Manual)"
else
  echo "  Pinned CSV:  <none, unpinned>"
fi
echo "  nmstate:     bundled (installed as CNV operand)"
