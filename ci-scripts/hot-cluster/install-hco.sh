#!/bin/bash
#
# Installs OpenShift Virtualization (CNV) from Red Hat's redhat-operators
# catalog into openshift-cnv.
#
# Environment variables (all have defaults):
#   KVM_EMULATION          - "true" or "false" (only bare metal nodes have real KVM)
#   CNV_CHANNEL            - OLM subscription channel (default: "stable")
#   CNV_PIN_VERSION        - "<major>.<minor>" to pin CNV to the newest matching CSV
#                            within CNV_CHANNEL via startingCSV (default: unpinned).
#                            Resolved dynamically against the live PackageManifest.
#                            Only takes effect at Subscription creation time --
#                            can't re-pin an already-installed cluster.
#   CNV_PIN_FALLBACK_UNPINNED - "true" to install unpinned (channel head) with a
#                            loud warning when CNV_PIN_VERSION has no matching CSV
#                            in the channel, instead of hard-failing (default:
#                            "false"). Lets release-branch CI stay green when the
#                            pinned CNV version simply isn't in the catalog yet
#                            (e.g. not GA), while a bare `install-hco.sh` run still
#                            fails hard by default.
#   HCO_CR_PATH            - Path to HCO CR yaml (default: playwright/fixtures/hco.yaml)
#   SKIP_HPP               - Set to "true" to skip HPP installation
#   HPP_VERSION            - HostPath Provisioner release branch
#   DEFAULT_STORAGE_CLASS  - Storage class to mark as the cluster default and the
#                            KubeVirt virt-default (default:
#                            "ibmc-vpc-block-10iops-tier"). Upstream HPP's
#                            hostpath-csi CSI driver bind-mounts /var/lib/kubelet
#                            and does not work on IBM ROKS (kubelet root is
#                            /var/data/kubelet), so golden-image imports hang on
#                            it. Golden images must use a working class such as
#                            IBM VPC block.
#
set -euo pipefail

export KVM_EMULATION="${KVM_EMULATION:-true}"
export CNV_CHANNEL="${CNV_CHANNEL:-stable}"
CNV_PIN_VERSION="${CNV_PIN_VERSION:-}"
CNV_PIN_FALLBACK_UNPINNED="${CNV_PIN_FALLBACK_UNPINNED:-false}"
HCO_CR_PATH="${HCO_CR_PATH:-playwright/fixtures/hco.yaml}"
SKIP_HPP="${SKIP_HPP:-false}"
HPP_VERSION="${HPP_VERSION:-release-v0.21}"
DEFAULT_STORAGE_CLASS="${DEFAULT_STORAGE_CLASS:-ibmc-vpc-block-10iops-tier}"

CNV_NS="openshift-cnv"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "=== OpenShift Virtualization (CNV) Installation ==="
echo "  KVM_EMULATION:   ${KVM_EMULATION}"
echo "  CNV_CHANNEL:     ${CNV_CHANNEL}"
echo "  CNV_PIN_VERSION: ${CNV_PIN_VERSION:-<none, unpinned>}"
echo "  CNV_NS:          ${CNV_NS}"
echo "  SKIP_HPP:        ${SKIP_HPP}"
echo "  DEFAULT_SC:      ${DEFAULT_STORAGE_CLASS}"
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
PIN_FALLBACK_OCCURRED="false"

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
  # Distinguishes a successful lookup that found no match (exit 0, empty output)
  # from a lookup that never completed (all retries failed). Only the former is a
  # genuine "this version isn't in the catalog"; the latter must not be mistaken
  # for it, or a transient API outage would wrongly trigger the unpinned fallback.
  LOOKUP_SUCCEEDED="false"
  for attempt in 1 2 3; do
    if STARTING_CSV="$(oc get packagemanifest -n openshift-marketplace -o json 2>/dev/null \
      | jq -r --arg ch "${CNV_CHANNEL}" --arg ver "${CNV_PIN_VERSION}." \
        '.items[]? | select(.metadata.name == "kubevirt-hyperconverged" and .status.catalogSource == "redhat-operators") | .status.channels[]? | select(.name == $ch) | .entries[]? | select((.version // "") | startswith($ver)) | "\(.version) \(.name)"' \
      | sort -V | tail -1 | awk '{print $2}')"; then
      LOOKUP_SUCCEEDED="true"
      break
    fi
    echo "  Retry ${attempt}/3 for packagemanifest lookup (API may be transiently unavailable)..."
    sleep 10
  done

  if [[ "${LOOKUP_SUCCEEDED}" != "true" ]]; then
    echo "ERROR: Could not query the PackageManifest catalog after 3 attempts (redhat-operators API unavailable)."
    echo "This is a lookup failure, not a confirmed 'no matching CSV' -- refusing to fall back to unpinned even with CNV_PIN_FALLBACK_UNPINNED=true, since the pin may well be valid."
    exit 1
  fi

  if [[ -z "${STARTING_CSV}" ]]; then
    if [[ "${CNV_PIN_FALLBACK_UNPINNED}" == "true" ]]; then
      echo "::warning::No CSV matching version prefix '${CNV_PIN_VERSION}.' found in channel '${CNV_CHANNEL}' (redhat-operators) -- CNV_PIN_FALLBACK_UNPINNED=true, so installing UNPINNED from the '${CNV_CHANNEL}' channel head instead of failing. The cluster will NOT be running the requested CNV ${CNV_PIN_VERSION}.x (it likely isn't in the catalog yet); treat these results as tested against the channel head, not the pinned release."
      PIN_FALLBACK_OCCURRED="true"
      # Leave STARTING_CSV empty and INSTALL_PLAN_APPROVAL=Automatic so the
      # rest of the script behaves exactly like an unpinned install.
    else
      echo "ERROR: No CSV matching version prefix '${CNV_PIN_VERSION}.' found in channel '${CNV_CHANNEL}' (redhat-operators)."
      echo "This is a hard failure rather than a silent fallback to the latest channel head. Set CNV_PIN_FALLBACK_UNPINNED=true to install unpinned instead, or override cnv_channel explicitly on the workflow dispatch."
      exit 1
    fi
  else
    echo "Resolved pinned CSV: ${STARTING_CSV}"
    INSTALL_PLAN_APPROVAL="Manual"
  fi
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

echo "  Checking for NetworkAttachmentDefinition CRD (Multus/OVN-Kubernetes)..."
if oc get crd networkattachmentdefinitions.k8s.cni.cncf.io &>/dev/null; then
  echo "  NAD CRD is present (OVN-Kubernetes with Multus)"
else
  echo "  WARNING: NAD CRD not present (expected with OVN-Kubernetes; missing on Calico-based clusters)"
fi

echo "  Waiting for common templates to be created..."
for i in $(seq 1 60); do
  TPL_COUNT=$(oc get templates -n openshift --no-headers 2>/dev/null | wc -l | tr -d ' ')
  if [[ "${TPL_COUNT}" -gt 0 ]]; then
    echo "  Found ${TPL_COUNT} common templates"
    break
  fi
  if [[ "${i}" -eq 60 ]]; then
    echo "  WARNING: No common templates found after 5 minutes"
  fi
  sleep 5
done

echo "  Waiting for DataSources in os-images namespace..."
for i in $(seq 1 60); do
  DS_COUNT=$(oc get datasource -n openshift-virtualization-os-images --no-headers 2>/dev/null | wc -l | tr -d ' ')
  if [[ "${DS_COUNT}" -gt 0 ]]; then
    echo "  Found ${DS_COUNT} DataSources in openshift-virtualization-os-images"
    break
  fi
  if [[ "${i}" -eq 60 ]]; then
    echo "  WARNING: No DataSources found after 5 minutes (DataImportCrons may still be importing)"
  fi
  sleep 5
done

echo "CNV operands are ready."

# --- Storage ---
# HPP is still installed for workloads that request hostpath-csi explicitly, but
# it must NOT be the default on IBM ROKS: upstream HPP's CSI driver bind-mounts
# /var/lib/kubelet while ROKS runs kubelet at /var/data/kubelet, so hostpath-csi
# cannot publish volumes and CDI golden-image imports hang indefinitely. We make
# a working IBM VPC block class the single default (and KubeVirt virt-default) so
# golden images and VM disks provision successfully.
if [[ "${SKIP_HPP}" != "true" ]]; then
  echo "Installing HostPath Provisioner (non-default)..."

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

  echo "HPP installation complete"
else
  echo "Skipping HPP installation (SKIP_HPP=true)"
fi

echo "Setting '${DEFAULT_STORAGE_CLASS}' as the default (and virt-default) storage class..."
if ! oc get storageclass "${DEFAULT_STORAGE_CLASS}" >/dev/null 2>&1; then
  echo "ERROR: storage class '${DEFAULT_STORAGE_CLASS}' not found. Available classes:"
  oc get storageclass -o name
  echo "Set DEFAULT_STORAGE_CLASS to a class that works on this cluster."
  exit 1
fi
for sc in $(oc get storageclasses -o jsonpath='{.items[*].metadata.name}'); do
  if [[ "${sc}" != "${DEFAULT_STORAGE_CLASS}" ]]; then
    oc annotate storageclass "${sc}" storageclass.kubernetes.io/is-default-class='false' --overwrite || true
  fi
done
oc annotate storageclass "${DEFAULT_STORAGE_CLASS}" \
  storageclass.kubernetes.io/is-default-class='true' \
  storageclass.kubevirt.io/is-default-virt-class='true' --overwrite

echo ""
echo "=== OpenShift Virtualization Installation Complete ==="
echo "  Namespace:   ${CNV_NS}"
echo "  Channel:     ${CNV_CHANNEL}"
if [[ -n "${STARTING_CSV}" ]]; then
  echo "  Pinned CSV:  ${STARTING_CSV} (installPlanApproval: Manual)"
elif [[ "${PIN_FALLBACK_OCCURRED}" == "true" ]]; then
  echo "  Pinned CSV:  <none> -- requested CNV ${CNV_PIN_VERSION}.x was not in the catalog; fell back to unpinned '${CNV_CHANNEL}' head (CNV_PIN_FALLBACK_UNPINNED=true)"
else
  echo "  Pinned CSV:  <none, unpinned>"
fi
echo "  nmstate:     bundled (installed as CNV operand)"
