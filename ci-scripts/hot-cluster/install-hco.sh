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
#                            IBM VPC block. Since this script re-runs on every CI
#                            job against the same persistent hot cluster, it also
#                            repairs any golden-image DataVolume that was already
#                            stuck importing on a broken storage class from before
#                            DEFAULT_STORAGE_CLASS was corrected -- see the
#                            "Diagnose + repair stuck golden images" step below.
#   DEFAULT_SC_ACCESS_MODE/DEFAULT_SC_VOLUME_MODE - Fallback accessMode/volumeMode
#                            (defaults: "ReadWriteOnce"/"Filesystem") applied to
#                            DEFAULT_STORAGE_CLASS's StorageProfile only when CDI
#                            hasn't resolved one itself. CDI auto-detects
#                            claimPropertySets for known CSI provisioners, but IBM
#                            VPC Block's "vpc.block.csi.ibm.io" isn't one of them,
#                            so its StorageProfile is permanently left with no
#                            claimPropertySets -- every DataVolume on it then fails
#                            forever with "no accessMode specified in
#                            StorageProfile ..." (ErrClaimNotValid), which is the
#                            actual reason golden images never import, independent
#                            of the hostpath-csi issue above. Confirmed live on
#                            kubevirt-plugin-420: patching this unblocked every
#                            golden image within ~1 minute.
#
#                            Separately, when a VolumeSnapshotClass exists for
#                            vpc.block.csi.ibm.io, CDI sets cloneStrategy=snapshot.
#                            IBM VPC Block refuses snapshots unless the source
#                            volume is attached to a running VSI -- golden-image
#                            PVCs are Bound but unattached -- so VM disks hang in
#                            SnapshotForSmartCloneInProgress
#                            (snapshots_source_volume_not_attached). This script
#                            forces cloneStrategy=copy on every IBM VPC
#                            StorageProfile (see CDI #3886).
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
DEFAULT_SC_ACCESS_MODE="${DEFAULT_SC_ACCESS_MODE:-ReadWriteOnce}"
DEFAULT_SC_VOLUME_MODE="${DEFAULT_SC_VOLUME_MODE:-Filesystem}"

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

# --- Ensure the default storage class's StorageProfile has claimPropertySets ---
# CDI can't create a PVC for any DataVolume without knowing its accessMode and
# volumeMode. It auto-detects these for known CSI provisioners, but doesn't
# recognize IBM VPC Block's "vpc.block.csi.ibm.io", so StorageProfile status
# stays empty forever and every DataVolume on this class fails permanently with
# "no accessMode specified in StorageProfile ..." (ErrClaimNotValid) -- this is
# the actual reason golden images never import, regardless of which storage
# class DEFAULT_STORAGE_CLASS points at. Only set spec.claimPropertySets as a
# fallback when CDI's own status is still empty, so a provisioner CDI already
# knows how to auto-detect (e.g. on a non-IBM cluster) is left alone.

echo "Waiting for StorageProfile '${DEFAULT_STORAGE_CLASS}' to be created by CDI..."
STORAGE_PROFILE_EXISTS="false"
for i in $(seq 1 60); do
  if oc get storageprofile "${DEFAULT_STORAGE_CLASS}" >/dev/null 2>&1; then
    echo "StorageProfile '${DEFAULT_STORAGE_CLASS}' found"
    STORAGE_PROFILE_EXISTS="true"
    break
  fi
  if [[ "${i}" -eq 60 ]]; then
    echo "ERROR: Timed out waiting for StorageProfile '${DEFAULT_STORAGE_CLASS}' to be created by CDI"
    exit 1
  fi
  echo "Waiting for StorageProfile '${DEFAULT_STORAGE_CLASS}'... (${i}/60)"
  sleep 5
done

# Query status.claimPropertySets without suppressing exit codes so that an API
# lookup failure exits with an error instead of being falsely treated as empty.
if ! EXISTING_CLAIM_PROPERTY_SETS="$(oc get storageprofile "${DEFAULT_STORAGE_CLASS}" -o jsonpath='{.status.claimPropertySets}')"; then
  echo "ERROR: Failed to query StorageProfile '${DEFAULT_STORAGE_CLASS}' status"
  exit 1
fi

if [[ -z "${EXISTING_CLAIM_PROPERTY_SETS}" || "${EXISTING_CLAIM_PROPERTY_SETS}" == "null" || "${EXISTING_CLAIM_PROPERTY_SETS}" == "[]" ]]; then
  echo "StorageProfile '${DEFAULT_STORAGE_CLASS}' has no CDI-resolved claimPropertySets; setting fallback ${DEFAULT_SC_ACCESS_MODE}/${DEFAULT_SC_VOLUME_MODE}..."
  oc patch storageprofile "${DEFAULT_STORAGE_CLASS}" --type=merge -p \
    "{\"spec\":{\"claimPropertySets\":[{\"accessModes\":[\"${DEFAULT_SC_ACCESS_MODE}\"],\"volumeMode\":\"${DEFAULT_SC_VOLUME_MODE}\"}]}}"
  for i in $(seq 1 30); do
    CPS="$(oc get storageprofile "${DEFAULT_STORAGE_CLASS}" -o jsonpath='{.status.claimPropertySets}')"
    if [[ -n "${CPS}" && "${CPS}" != "null" && "${CPS}" != "[]" ]]; then
      echo "StorageProfile '${DEFAULT_STORAGE_CLASS}' status now has claimPropertySets: ${CPS}"
      break
    fi
    if [[ "${i}" -eq 30 ]]; then
      echo "ERROR: CDI did not propagate fallback claimPropertySets to StorageProfile '${DEFAULT_STORAGE_CLASS}' status"
      exit 1
    fi
    sleep 2
  done
else
  echo "StorageProfile '${DEFAULT_STORAGE_CLASS}' already has claimPropertySets: ${EXISTING_CLAIM_PROPERTY_SETS}"
fi

# --- Force host-assisted clone for IBM VPC Block ---
# CDI picks snapshot smart-clone when a VolumeSnapshotClass exists for the
# provisioner. IBM VPC Block CSI returns snapshots_source_volume_not_attached
# for unattached golden-image PVCs, so VM provisioning sticks in
# SnapshotForSmartCloneInProgress forever. Override to copy (host-assisted).
#
# StorageProfiles are created asynchronously by CDI and may exist before
# status.provisioner is populated. When IBM VPC Block StorageClasses are
# present, wait for matching profiles rather than treating an empty
# provisioner filter as "not an IBM cluster".
IBM_VPC_PROVISIONER="vpc.block.csi.ibm.io"
echo "Ensuring IBM VPC Block StorageProfiles use cloneStrategy=copy..."
IBM_VPC_SCS="$(oc get storageclass -o json \
  | jq -r --arg p "${IBM_VPC_PROVISIONER}" \
    '.items[] | select(.provisioner == $p) | .metadata.name')"
if [[ -z "${IBM_VPC_SCS}" ]]; then
  echo "  No ${IBM_VPC_PROVISIONER} StorageClasses found; skipping cloneStrategy override"
else
  IBM_VPC_PROFILES=""
  for i in $(seq 1 60); do
    IBM_VPC_PROFILES="$(oc get storageprofile -o json \
      | jq -r --arg p "${IBM_VPC_PROVISIONER}" \
        '.items[] | select(.status.provisioner == $p) | .metadata.name')"
    missing=""
    while IFS= read -r sc; do
      [[ -z "${sc}" ]] && continue
      if ! printf '%s\n' "${IBM_VPC_PROFILES}" | grep -Fxq "${sc}"; then
        missing="${missing} ${sc}"
      fi
    done <<< "${IBM_VPC_SCS}"
    if [[ -z "${missing}" ]]; then
      echo "  All IBM VPC Block StorageProfiles reported provisioner ${IBM_VPC_PROVISIONER}"
      break
    fi
    if [[ "${i}" -eq 60 ]]; then
      echo "ERROR: Timed out waiting for StorageProfiles for IBM VPC Block StorageClasses."
      echo "ERROR: Still missing provisioner=${IBM_VPC_PROVISIONER} on:${missing}"
      echo "ERROR: StorageClasses present:"
      echo "${IBM_VPC_SCS}" | sed 's/^/  /'
      echo "ERROR: StorageProfiles with that provisioner so far:"
      echo "${IBM_VPC_PROFILES:-  (none)}" | sed 's/^/  /'
      exit 1
    fi
    echo "  Waiting for IBM VPC Block StorageProfiles (${i}/60); missing:${missing}"
    sleep 5
  done

  while IFS= read -r sp; do
    [[ -z "${sp}" ]] && continue
    current="$(oc get storageprofile "${sp}" -o jsonpath='{.status.cloneStrategy}' 2>/dev/null || true)"
    if [[ "${current}" == "copy" ]]; then
      # status.cloneStrategy can be copy while spec is unset (CDI-inferred).
      # Persist spec so a later CDI reconcile cannot flip back to snapshot.
      spec_strategy="$(oc get storageprofile "${sp}" -o jsonpath='{.spec.cloneStrategy}' 2>/dev/null || true)"
      if [[ "${spec_strategy}" == "copy" ]]; then
        echo "  StorageProfile '${sp}' already cloneStrategy=copy"
        continue
      fi
      echo "  StorageProfile '${sp}' status is copy but spec.cloneStrategy is '${spec_strategy:-<unset>}'; persisting copy..."
    fi
    echo "  Patching StorageProfile '${sp}' cloneStrategy: ${current:-<unset>} -> copy"
    oc patch storageprofile "${sp}" --type=merge -p '{"spec":{"cloneStrategy":"copy"}}'
    for i in $(seq 1 30); do
      current="$(oc get storageprofile "${sp}" -o jsonpath='{.status.cloneStrategy}' 2>/dev/null || true)"
      if [[ "${current}" == "copy" ]]; then
        echo "  StorageProfile '${sp}' status.cloneStrategy is now copy"
        break
      fi
      if [[ "${i}" -eq 30 ]]; then
        echo "ERROR: StorageProfile '${sp}' status.cloneStrategy did not become copy (still '${current:-<empty>}')"
        exit 1
      fi
      sleep 2
    done
  done <<< "${IBM_VPC_PROFILES}"
fi

# --- Diagnose + repair stuck golden images ---
# Re-annotating the default storage class above does not retroactively fix
# golden-image DataVolumes that already started (and got permanently stuck)
# importing on a broken storage class before DEFAULT_STORAGE_CLASS pointed
# here -- e.g. on a persistent hot cluster created before this script set the
# default correctly. Delete any DataVolume in the os-images namespace that
# hasn't reached Succeeded; CDI's DataImportCronJob controller notices its
# managed DataVolume is missing and immediately recreates one (it does not
# wait for the next scheduled cron tick), this time under the now-correct
# default storage class. On a healthy cluster every DataVolume is already
# Succeeded, so this is a no-op.
#
# Always dump DataVolume/DataSource/StorageProfile state first (not just for
# the stuck ones) -- the UI's "Bootable volumes" list can read as empty for
# reasons a DataVolume phase check alone won't catch (e.g. a Ready=False
# DataSource whose backing DataVolume nonetheless reports Succeeded), so this
# is cheap, always-on evidence for diagnosing exactly that kind of mismatch.
echo "Golden-image DataVolume status in openshift-virtualization-os-images:"
oc get datavolume -n openshift-virtualization-os-images \
  -o custom-columns='NAME:.metadata.name,PHASE:.status.phase,PROGRESS:.status.progress,REASON:.status.conditions[?(@.type=="Bound")].reason' \
  2>/dev/null || echo "  (unable to list DataVolumes)"

echo "DataSource readiness in openshift-virtualization-os-images:"
oc get datasource -n openshift-virtualization-os-images \
  -o custom-columns='NAME:.metadata.name,READY:.status.conditions[?(@.type=="Ready")].status,REASON:.status.conditions[?(@.type=="Ready")].reason,SOURCE_PVC:.spec.source.pvc.name' \
  2>/dev/null || echo "  (unable to list DataSources)"

echo "StorageProfile claimPropertySets for '${DEFAULT_STORAGE_CLASS}':"
oc get storageprofile "${DEFAULT_STORAGE_CLASS}" -o jsonpath='{.status.claimPropertySets}' 2>/dev/null || echo "  (unable to read StorageProfile)"
echo ""

echo "Checking for stuck golden-image imports..."
STUCK_DVS="$(oc get datavolume -n openshift-virtualization-os-images -o json 2>/dev/null \
  | jq -r '.items[]? | select(.status.phase != "Succeeded") | .metadata.name' || true)"

if [[ -n "${STUCK_DVS}" ]]; then
  echo "Found stuck DataVolume(s), deleting so CDI reimports them on '${DEFAULT_STORAGE_CLASS}':"
  while IFS= read -r dv; do
    [[ -z "${dv}" ]] && continue
    echo "  Repairing ${dv}..."
    oc delete datavolume "${dv}" -n openshift-virtualization-os-images --ignore-not-found --wait=false
    oc delete pvc "${dv}" -n openshift-virtualization-os-images --ignore-not-found --wait=false
  done <<< "${STUCK_DVS}"

  # Poll the specific names we deleted (not "any non-Succeeded DV"): with
  # --wait=false the DV can vanish briefly before CDI recreates it, which
  # would look like an empty stuck-set and exit this loop too early.
  echo "Waiting for repaired golden images to re-import (best-effort, up to 10 minutes)..."
  for i in $(seq 1 60); do
    STILL_BAD=0
    STILL_BAD_NAMES=""
    while IFS= read -r dv; do
      [[ -z "${dv}" ]] && continue
      # Succeeded + deletionTimestamp set means the old object is still
      # terminating; keep waiting for CDI's replacement (no deletionTimestamp).
      DV_STATE="$(oc get datavolume "${dv}" -n openshift-virtualization-os-images \
        -o jsonpath='{.status.phase}{"\t"}{.metadata.deletionTimestamp}' 2>/dev/null || true)"
      PHASE="${DV_STATE%%$'\t'*}"
      DELETING="${DV_STATE#*$'\t'}"
      if [[ "${PHASE}" != "Succeeded" || -n "${DELETING}" ]]; then
        STILL_BAD=$((STILL_BAD + 1))
        if [[ -n "${DELETING}" ]]; then
          STILL_BAD_NAMES="${STILL_BAD_NAMES} ${dv}(${PHASE:-Missing}+Deleting)"
        else
          STILL_BAD_NAMES="${STILL_BAD_NAMES} ${dv}(${PHASE:-Missing})"
        fi
      fi
    done <<< "${STUCK_DVS}"
    if [[ "${STILL_BAD}" -eq 0 ]]; then
      echo "  All repaired golden images are now Succeeded"
      break
    fi
    if [[ "${i}" -eq 60 ]]; then
      echo "  WARNING: ${STILL_BAD} repaired golden image(s) still not Succeeded after 10 minutes:${STILL_BAD_NAMES}"
      while IFS= read -r dv; do
        [[ -z "${dv}" ]] && continue
        DV_STATE="$(oc get datavolume "${dv}" -n openshift-virtualization-os-images \
          -o jsonpath='{.status.phase}{"\t"}{.metadata.deletionTimestamp}' 2>/dev/null || true)"
        PHASE="${DV_STATE%%$'\t'*}"
        DELETING="${DV_STATE#*$'\t'}"
        [[ "${PHASE}" == "Succeeded" && -z "${DELETING}" ]] && continue
        echo "  --- oc describe datavolume ${dv} ---"
        oc describe datavolume "${dv}" -n openshift-virtualization-os-images 2>/dev/null || true
      done <<< "${STUCK_DVS}"
    else
      echo "  Waiting for repaired DataVolumes (${i}/60); not Succeeded yet:${STILL_BAD_NAMES}"
    fi
    sleep 10
  done
else
  echo "No stuck golden-image imports found"
fi

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
