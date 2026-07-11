#!/usr/bin/env bash
set -euo pipefail

# Emits cluster_name=..., openshift_version=..., and test_engine=... for
# GITHUB_OUTPUT.
#
# Runs against a release-<major>.<minor> base branch get a dedicated,
# version-matched cluster (kubevirt-plugin-<major><minor>) instead of
# silently colliding with main's kubevirt-plugin-ci cluster. BASE_REF comes
# from github.base_ref on pull_request_target, or from the workflow_dispatch
# base_ref input (forwarded by /retest-e2e for PR retests). Any other base
# branch, and every workflow_dispatch without a release base_ref, falls
# back to the provided input (or the repo's long-standing default).
#
# test_engine follows the same release-branch detection: release-4.22 and
# earlier predate the Cypress → Playwright migration on main (see
# 9d7fe93c6), so they still carry a cypress/ suite instead of playwright/.
# Everything else (main, any future release-4.23+, non-release bases) is
# Playwright-only.
#
# Env:
#   BASE_REF                - PR target branch (e.g. release-4.20), from
#                             github.base_ref or workflow_dispatch inputs.base_ref
#   INPUT_CLUSTER_NAME       - workflow_dispatch inputs.cluster_name, if set
#   INPUT_OPENSHIFT_VERSION  - workflow_dispatch inputs.openshift_version, if set
#   INPUT_TEST_ENGINE        - workflow_dispatch inputs.test_engine ('auto'/'playwright'/'cypress'), if set
#
# Usage (from a workflow step):
#   ./ci-scripts/hot-cluster/resolve-cluster-config.sh >> "$GITHUB_OUTPUT"

DEFAULT_CLUSTER_NAME="kubevirt-plugin-ci"
DEFAULT_OPENSHIFT_VERSION="4.22_openshift"
DEFAULT_TEST_ENGINE="playwright"

# Last release branch still on the pre-migration Cypress suite. Any branch
# release-<major>.<minor> with major.minor <= this threshold uses Cypress.
LAST_CYPRESS_MAJOR=4
LAST_CYPRESS_MINOR=22

BASE_REF="${BASE_REF:-}"
INPUT_CLUSTER_NAME="${INPUT_CLUSTER_NAME:-}"
INPUT_OPENSHIFT_VERSION="${INPUT_OPENSHIFT_VERSION:-}"
INPUT_TEST_ENGINE="${INPUT_TEST_ENGINE:-}"

if [[ "${BASE_REF}" =~ ^release-([0-9]+)\.([0-9]+)$ ]]; then
  MAJOR="${BASH_REMATCH[1]}"
  MINOR="${BASH_REMATCH[2]}"
  CLUSTER_NAME="kubevirt-plugin-${MAJOR}${MINOR}"
  OPENSHIFT_VERSION="${MAJOR}.${MINOR}_openshift"
  echo "Base branch '${BASE_REF}' is a release branch → cluster '${CLUSTER_NAME}' (${OPENSHIFT_VERSION})" >&2

  if (( MAJOR * 1000 + MINOR <= LAST_CYPRESS_MAJOR * 1000 + LAST_CYPRESS_MINOR )); then
    TEST_ENGINE="cypress"
  else
    TEST_ENGINE="playwright"
  fi
  echo "Base branch '${BASE_REF}' → test engine '${TEST_ENGINE}'" >&2
else
  CLUSTER_NAME="${INPUT_CLUSTER_NAME:-${DEFAULT_CLUSTER_NAME}}"
  OPENSHIFT_VERSION="${INPUT_OPENSHIFT_VERSION:-${DEFAULT_OPENSHIFT_VERSION}}"
  echo "Using default/workflow_dispatch cluster config: '${CLUSTER_NAME}' (${OPENSHIFT_VERSION})" >&2
  TEST_ENGINE="${DEFAULT_TEST_ENGINE}"
fi

# An explicit, non-'auto' workflow_dispatch override always wins over
# base_ref auto-detection.
if [[ -n "${INPUT_TEST_ENGINE}" && "${INPUT_TEST_ENGINE}" != "auto" ]]; then
  TEST_ENGINE="${INPUT_TEST_ENGINE}"
  echo "Overriding test engine from input: '${TEST_ENGINE}'" >&2
fi

echo "cluster_name=${CLUSTER_NAME}"
echo "openshift_version=${OPENSHIFT_VERSION}"
echo "test_engine=${TEST_ENGINE}"
