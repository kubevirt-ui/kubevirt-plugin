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

BASE_REF="${BASE_REF:-}"
INPUT_CLUSTER_NAME="${INPUT_CLUSTER_NAME:-}"
INPUT_OPENSHIFT_VERSION="${INPUT_OPENSHIFT_VERSION:-}"
INPUT_TEST_ENGINE="${INPUT_TEST_ENGINE:-}"
INPUT_CNV_CHANNEL="${INPUT_CNV_CHANNEL:-}"

if [[ "${BASE_REF}" =~ ^release-([0-9]+)\.([0-9]+)$ ]]; then
  MAJOR="${BASH_REMATCH[1]}"
  MINOR="${BASH_REMATCH[2]}"
  CLUSTER_NAME="kubevirt-plugin-${MAJOR}${MINOR}"
  OPENSHIFT_VERSION="${MAJOR}.${MINOR}_openshift"
  CNV_CHANNEL="${DEFAULT_CNV_CHANNEL}"
  CNV_PIN_VERSION="${MAJOR}.${MINOR}"
  echo "Base branch '${BASE_REF}' is a release branch → cluster '${CLUSTER_NAME}' (${OPENSHIFT_VERSION}, CNV channel '${CNV_CHANNEL}', pinned to CNV ${CNV_PIN_VERSION}.x)" >&2

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
  echo "Using default/workflow_dispatch cluster config: '${CLUSTER_NAME}' (${OPENSHIFT_VERSION}, CNV channel '${CNV_CHANNEL}')" >&2
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
# Empty when there's no PR context -- callers add a ref_name fallback for display.
echo "branch_name=${BASE_REF}"
