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
#   CNV_PIN_VERSION        - "<major>.<minor>" to pin CNV to the newest matching CSV
#                            within CNV_CHANNEL via startingCSV, instead of installing
#                            whatever the channel head currently resolves to (default:
#                            empty/unpinned). Resolved dynamically against the live
#                            PackageManifest at install time -- if no CSV matching this
#                            version prefix is found (e.g. pruned from the channel's
#                            entry graph), this is a hard failure (exit 1), NOT a
#                            silent fallback to the latest channel head: installing an
#                            unexpectedly newer CNV than the pin requested is a worse
#                            outcome than failing the build, since it can make release
#                            CI pass against the wrong product version without anyone
#                            noticing. To deliberately install unpinned, override
#                            cnv_channel explicitly on the workflow dispatch instead
#                            (any explicit cnv_channel override clears the pin -- see
#                            resolve-cluster-config.sh). Pinning also switches
#                            installPlanApproval to Manual and approves only the
#                            initial InstallPlan (after verifying it actually targets
#                            STARTING_CSV -- guards against re-running this script
#                            against an already-provisioned Subscription that has
#                            since advanced to a later upgrade InstallPlan), so later
#                            channel upgrades don't silently move the cluster off the
#                            pinned version. Pinning only takes effect at Subscription
#                            creation time -- it cannot re-pin or downgrade a cluster
#                            that already has CNV installed (this script only ever
#                            runs once per cluster's lifetime; see hot-cluster-check.yml
#                            and ibmc-cluster-setup.yml's precheck job).
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
# Only the channel head can be selected by name -- version-matching an old
# release branch's CNV needs a specific CSV pinned via startingCSV, looked
# up dynamically against the live catalog (no static version table to
# maintain, and it naturally tracks z-stream bumps).
STARTING_CSV=""
INSTALL_PLAN_APPROVAL="Automatic"

if [[ -n "${CNV_PIN_VERSION}" ]]; then
  # Validate defensively -- a malformed value (bad override, upstream bug)
  # must fail loudly here, not silently produce a meaningless jq/sort -V
  # comparison below that could match nothing (or, worse, everything).
  if [[ ! "${CNV_PIN_VERSION}" =~ ^[0-9]+\.[0-9]+$ ]]; then
    echo "ERROR: CNV_PIN_VERSION='${CNV_PIN_VERSION}' is not a valid \"<major>.<minor>\" version (e.g. \"4.20\")."
    exit 1
  fi

  echo "Resolving pinned CSV for CNV_PIN_VERSION=${CNV_PIN_VERSION} from channel '${CNV_CHANNEL}'..."
  # Query the full list (not `oc get packagemanifest kubevirt-hyperconverged`
  # by name) and filter by catalogSource explicitly -- a PackageManifest's
  # .metadata.name isn't guaranteed unique across catalog sources, so
  # fetching by name alone risks an ambiguous/wrong match if another source
  # happens to expose a same-named package. Matching catalogSource ==
  # redhat-operators keeps this in lockstep with the Subscription below,
  # which pins to that exact source.
  #
  # Retried like the HPP/HCO CR applies below -- with `pipefail` active, a
  # transient `oc get` failure (plausible right after cluster creation,
  # while the API/catalog operator may still be stabilizing) would
  # otherwise trip `set -e` and abort the whole script immediately, instead
  # of just this one lookup. A genuine "no match" result still exits 0 (jq/
  # sort/tail/awk all succeed on empty input), so this only retries real
  # command failures -- the empty-result handling below is unaffected.
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
    echo "This branch's CNV version may have aged out of the channel's retained entry graph, or something else is wrong -- investigate before proceeding."
    echo "This is a hard failure rather than a silent fallback to the latest '${CNV_CHANNEL}' head: installing an unexpectedly newer CNV than requested could make this branch's CI pass against the wrong product version without anyone noticing."
    echo "To deliberately install unpinned, override cnv_channel explicitly on the workflow dispatch (any explicit cnv_channel override clears the pin)."
    exit 1
  fi

  echo "Resolved pinned CSV: ${STARTING_CSV}"
  INSTALL_PLAN_APPROVAL="Manual"
fi

# --- Subscription ---
# installPlanApproval stays Manual (never re-approved beyond the one plan
# below) when pinned, so a later upgrade InstallPlan the channel generates
# is intentionally left pending instead of silently moving the cluster off
# STARTING_CSV.
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
  # against an already-provisioned Subscription (e.g. a retry after a
  # transient failure earlier in this same job, before the cluster's own
  # DNS/API is up) -- installPlanRef can have moved on to a later upgrade
  # InstallPlan by then, and blindly approving it would silently unpin the
  # cluster to whatever the channel head is at that point.
  PLAN_CSVS="$(oc get installplan "${INSTALL_PLAN}" -n ${CNV_NS} -o jsonpath='{.spec.clusterServiceVersionNames[*]}' 2>/dev/null || true)"
  if [[ " ${PLAN_CSVS} " != *" ${STARTING_CSV} "* ]]; then
    echo "ERROR: InstallPlan ${INSTALL_PLAN} does not target the pinned CSV ${STARTING_CSV} (it targets: ${PLAN_CSVS:-<none>})."
    echo "Refusing to approve it -- this would silently move the cluster off the pinned version. Investigate manually (a stale Subscription from a prior run is the most likely cause)."
    exit 1
  fi

  echo "Approving the initial InstallPlan (${INSTALL_PLAN}) for pinned CSV ${STARTING_CSV}..."
  echo "This is the only InstallPlan this script will ever approve -- installPlanApproval stays Manual, so any later upgrade InstallPlan the channel generates is intentionally left pending (harmless -- it never installs without a further explicit approval this script never gives), keeping CNV pinned at this version."
  oc patch installplan "${INSTALL_PLAN}" -n ${CNV_NS} --type merge -p '{"spec":{"approved":true}}'
fi

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "starting_csv=${STARTING_CSV}" >> "$GITHUB_OUTPUT"
fi

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

# --- Confirm the installed CSV actually matches the pin, if requested ---
# Belt-and-suspenders check: the InstallPlan-targeting guard above should
# already guarantee this, but confirming what's actually running (not just
# what was approved) catches anything unexpected between approval and now.
# Hard failure, not a warning -- same fail-closed reasoning as the
# resolution step above: letting the build succeed while quietly running an
# unexpected CNV version is worse than failing it outright.
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
