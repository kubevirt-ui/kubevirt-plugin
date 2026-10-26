#!/usr/bin/env bash
set -euo pipefail

# Resolves cluster_name/openshift_version/test_engine/cnv_channel/
# cnv_pin_version/branch_name for GITHUB_OUTPUT. See ci-scripts/README.md
# ("Cluster & Test-Engine Resolution") for the release-branch naming,
# Cypress/Playwright cutoff, and CNV channel/pin rules.
#
# Env:
#   BASE_REF                - PR target branch, from github.base_ref or
#                             workflow_dispatch inputs.base_ref
#   INPUT_CLUSTER_NAME       - workflow_dispatch inputs.cluster_name, if set
#   INPUT_OPENSHIFT_VERSION  - workflow_dispatch inputs.openshift_version, if set
#   INPUT_TEST_ENGINE        - workflow_dispatch inputs.test_engine ('auto'/'playwright'/'cypress'), if set
#   INPUT_CNV_CHANNEL        - workflow_dispatch inputs.cnv_channel, if set
#
# Usage: ./ci-scripts/hot-cluster/resolve-cluster-config.sh >> "$GITHUB_OUTPUT"

DEFAULT_CLUSTER_NAME="kubevirt-plugin-ci"
DEFAULT_OPENSHIFT_VERSION="4.22_openshift"
DEFAULT_TEST_ENGINE="playwright"
DEFAULT_CNV_CHANNEL="stable"

# Last release branch still on the pre-migration Cypress suite. Any branch
# release-<major>.<minor> with major.minor <= this threshold uses Cypress.
LAST_CYPRESS_MAJOR=4
LAST_CYPRESS_MINOR=22

# Window of OpenShift versions we can actually provision on IBM Cloud. VPC
# cluster creation with an explicit CNI (--cni OVNKubernetes) is rejected
# below 4.20 ("version is not supported for CNI selection in VPC. Specify
# 4.20 or later", E0723), so 4.20+ uses OVNKubernetes. Below that, down to
# 4.18, create-roks-vpc.ts omits --cni entirely, which provisions with VPC's
# platform-default CNI (Calico) instead -- see cni_plugin_for below. A
# release branch outside this window still provisions, clamped to the
# nearest supported version; the branch's own cluster_name/test_engine stay
# tied to the real branch, and CNV is left unpinned when a clamp happens
# (see below).
MIN_SUPPORTED_MAJOR=4
MIN_SUPPORTED_MINOR=18
MAX_SUPPORTED_MAJOR=4
MAX_SUPPORTED_MINOR=22

# OpenShift versions below this use Calico (CNI_PLUGIN left empty, so
# create-roks-vpc.ts omits --cni) since VPC rejects explicit CNI selection
# below 4.20; at/above this, OVNKubernetes is requested explicitly.
OVN_MIN_MAJOR=4
OVN_MIN_MINOR=20

# Echoes the CNI plugin to request for a given "<major> <minor>" pair: empty
# (Calico, via omitted --cni) below the OVN floor, else "OVNKubernetes".
cni_plugin_for() {
  local major="$1" minor="$2"
  local v=$(( major * 1000 + minor ))
  local ovn_min=$(( OVN_MIN_MAJOR * 1000 + OVN_MIN_MINOR ))
  if (( v < ovn_min )); then
    echo ""
  else
    echo "OVNKubernetes"
  fi
}

# Splits an "<major>.<minor>_openshift"-style version string into
# "<major> <minor>"; falls back to the OVN floor (so an unparseable string
# defaults to the safe, explicit-CNI behavior) if it doesn't match.
major_minor_from_version() {
  local version="$1"
  if [[ "${version}" =~ ^([0-9]+)\.([0-9]+)_openshift$ ]]; then
    echo "${BASH_REMATCH[1]} ${BASH_REMATCH[2]}"
  else
    echo "${OVN_MIN_MAJOR} ${OVN_MIN_MINOR}"
  fi
}

# Clamp a "<major> <minor>" pair into the supported range; echoes "<major> <minor>".
clamp_version() {
  local major="$1" minor="$2"
  local v=$(( major * 1000 + minor ))
  local min=$(( MIN_SUPPORTED_MAJOR * 1000 + MIN_SUPPORTED_MINOR ))
  local max=$(( MAX_SUPPORTED_MAJOR * 1000 + MAX_SUPPORTED_MINOR ))
  if (( v < min )); then
    echo "${MIN_SUPPORTED_MAJOR} ${MIN_SUPPORTED_MINOR}"
  elif (( v > max )); then
    echo "${MAX_SUPPORTED_MAJOR} ${MAX_SUPPORTED_MINOR}"
  else
    echo "${major} ${minor}"
  fi
}

BASE_REF="${BASE_REF:-}"
INPUT_CLUSTER_NAME="${INPUT_CLUSTER_NAME:-}"
INPUT_OPENSHIFT_VERSION="${INPUT_OPENSHIFT_VERSION:-}"
INPUT_TEST_ENGINE="${INPUT_TEST_ENGINE:-}"
INPUT_CNV_CHANNEL="${INPUT_CNV_CHANNEL:-}"

if [[ "${BASE_REF}" =~ ^release-([0-9]+)\.([0-9]+)$ ]]; then
  MAJOR="${BASH_REMATCH[1]}"
  MINOR="${BASH_REMATCH[2]}"
  CLUSTER_NAME="kubevirt-plugin-${MAJOR}${MINOR}"
  CNV_CHANNEL="${DEFAULT_CNV_CHANNEL}"

  # Clamp the cluster's OpenShift version into the IBM Cloud supported range.
  # When a clamp happens, leave CNV unpinned: the branch's CNV CSV won't exist
  # in the clamped cluster's catalog, so install-hco.sh would hard-fail on it.
  CLAMPED="$(clamp_version "${MAJOR}" "${MINOR}")"
  CLAMPED_MAJOR="${CLAMPED% *}"
  CLAMPED_MINOR="${CLAMPED#* }"
  OPENSHIFT_VERSION="${CLAMPED_MAJOR}.${CLAMPED_MINOR}_openshift"
  CNI_PLUGIN="$(cni_plugin_for "${CLAMPED_MAJOR}" "${CLAMPED_MINOR}")"
  if [[ "${CLAMPED_MAJOR}.${CLAMPED_MINOR}" != "${MAJOR}.${MINOR}" ]]; then
    CNV_PIN_VERSION=""
    echo "Branch version ${MAJOR}.${MINOR} is outside the IBM Cloud supported range ${MIN_SUPPORTED_MAJOR}.${MIN_SUPPORTED_MINOR}-${MAX_SUPPORTED_MAJOR}.${MAX_SUPPORTED_MINOR}; clamping cluster OpenShift version to ${CLAMPED_MAJOR}.${CLAMPED_MINOR} and installing CNV unpinned (stable)" >&2
    echo "Base branch '${BASE_REF}' is a release branch → cluster '${CLUSTER_NAME}' (${OPENSHIFT_VERSION}, CNV channel '${CNV_CHANNEL}', CNV unpinned)" >&2
  else
    CNV_PIN_VERSION="${MAJOR}.${MINOR}"
    echo "Base branch '${BASE_REF}' is a release branch → cluster '${CLUSTER_NAME}' (${OPENSHIFT_VERSION}, CNV channel '${CNV_CHANNEL}', pinned to CNV ${CNV_PIN_VERSION}.x)" >&2
  fi
  echo "CNI plugin: '${CNI_PLUGIN:-<platform default, Calico>}'" >&2

  if (( MAJOR * 1000 + MINOR <= LAST_CYPRESS_MAJOR * 1000 + LAST_CYPRESS_MINOR )); then
    TEST_ENGINE="cypress"
  else
    TEST_ENGINE="playwright"
  fi
  echo "Base branch '${BASE_REF}' → test engine '${TEST_ENGINE}'" >&2
else
  CLUSTER_NAME="${INPUT_CLUSTER_NAME:-${DEFAULT_CLUSTER_NAME}}"
  OPENSHIFT_VERSION="${INPUT_OPENSHIFT_VERSION:-${DEFAULT_OPENSHIFT_VERSION}}"
  CNV_CHANNEL="${DEFAULT_CNV_CHANNEL}"
  CNV_PIN_VERSION=""
  read -r VERSION_MAJOR VERSION_MINOR <<< "$(major_minor_from_version "${OPENSHIFT_VERSION}")"
  CNI_PLUGIN="$(cni_plugin_for "${VERSION_MAJOR}" "${VERSION_MINOR}")"
  echo "Using default/workflow_dispatch cluster config: '${CLUSTER_NAME}' (${OPENSHIFT_VERSION}, CNV channel '${CNV_CHANNEL}', CNI plugin '${CNI_PLUGIN:-<platform default, Calico>}')" >&2
  TEST_ENGINE="${DEFAULT_TEST_ENGINE}"
fi

# An explicit, non-'auto' workflow_dispatch override always wins over
# base_ref auto-detection.
if [[ -n "${INPUT_TEST_ENGINE}" && "${INPUT_TEST_ENGINE}" != "auto" ]]; then
  TEST_ENGINE="${INPUT_TEST_ENGINE}"
  echo "Overriding test engine from input: '${TEST_ENGINE}'" >&2
fi

# An explicit workflow_dispatch override always wins over the default
# unversioned 'stable' channel (e.g. experimenting with startingCSV /
# Manual approval for an older CSV -- not versioned channel names).
if [[ -n "${INPUT_CNV_CHANNEL}" ]]; then
  CNV_CHANNEL="${INPUT_CNV_CHANNEL}"
  CNV_PIN_VERSION=""
  echo "Overriding CNV channel from input: '${CNV_CHANNEL}' (clearing auto-pinned CNV version -- an explicit channel override takes full manual control)" >&2
fi

echo "cluster_name=${CLUSTER_NAME}"
echo "openshift_version=${OPENSHIFT_VERSION}"
echo "test_engine=${TEST_ENGINE}"
echo "cnv_channel=${CNV_CHANNEL}"
echo "cnv_pin_version=${CNV_PIN_VERSION}"
echo "cni_plugin=${CNI_PLUGIN}"
# Empty when there's no PR context -- callers add a ref_name fallback for display.
echo "branch_name=${BASE_REF}"
