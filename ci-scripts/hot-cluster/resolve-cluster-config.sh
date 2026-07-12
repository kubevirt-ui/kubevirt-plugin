#!/usr/bin/env bash
set -euo pipefail

# Emits cluster_name=..., openshift_version=..., test_engine=...,
# branch_name=..., cnv_channel=..., and cnv_pin_version=... for
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
# cnv_channel always resolves to the catalog's real channel, 'stable' --
# the redhat-operators catalog for kubevirt-hyperconverged only ever
# exposes a single unversioned 'stable' channel (per Red Hat's own install
# docs); there is no 'stable-4.X' per-version channel. A prior version of
# this script constructed one anyway, which created a Subscription OLM
# could never resolve an InstallPlan for (confirmed live: cluster
# provisioning hung for 10+ minutes then failed outright). Actually
# version-pinning old CNV releases would need startingCSV + Manual
# approval on the Subscription, not a differently-named channel --
# INPUT_CNV_CHANNEL below remains available as an explicit override for
# anyone who wants to try a different channel directly.
#
# cnv_pin_version carries that startingCSV pinning: for a release branch,
# it resolves to "<major>.<minor>" (e.g. "4.20") -- install-hco.sh queries
# the live PackageManifest for the 'stable' channel's newest CSV whose
# version starts with that prefix, and pins the Subscription to it via
# startingCSV + installPlanApproval: Manual. If that version can't be
# found (e.g. pruned from the channel's entry graph), install-hco.sh fails
# the build rather than silently falling back to the latest 'stable' head
# -- installing an unexpectedly newer CNV than requested could make a
# release branch's CI pass against the wrong product version unnoticed.
# INPUT_CNV_CHANNEL below remains the explicit escape hatch for anyone who
# wants to deliberately install unpinned instead. Left empty for
# main/default/workflow_dispatch, which keep installing whatever 'stable'
# currently resolves to, same as before.
#
# Env:
#   BASE_REF                - PR target branch (e.g. release-4.20), from
#                             github.base_ref or workflow_dispatch inputs.base_ref
#   INPUT_CLUSTER_NAME       - workflow_dispatch inputs.cluster_name, if set
#   INPUT_OPENSHIFT_VERSION  - workflow_dispatch inputs.openshift_version, if set
#   INPUT_TEST_ENGINE        - workflow_dispatch inputs.test_engine ('auto'/'playwright'/'cypress'), if set
#   INPUT_CNV_CHANNEL        - workflow_dispatch inputs.cnv_channel, if set
#
# Usage (from a workflow step):
#   ./ci-scripts/hot-cluster/resolve-cluster-config.sh >> "$GITHUB_OUTPUT"

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
# Raw resolved base branch (e.g. "main", "release-4.20"), or empty when
# there's none (plain workflow_dispatch with no PR context) -- callers
# combine this with a ref_name fallback for display purposes (e.g. the
# "Hot cluster ready [...]" Slack notification), since resolving that
# fallback needs the github context, not available inside this script.
echo "branch_name=${BASE_REF}"
