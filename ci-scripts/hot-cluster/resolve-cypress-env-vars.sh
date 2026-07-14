#!/usr/bin/env bash
set -euo pipefail

# Resolves everything hot-cluster-e2e-run.yml needs to run Cypress against a
# given CNV pin version's checked-out content: TEST_NS/TEST_SECRET_NAME (and
# whether same-cluster runs must be serialized), whether a test secret
# fixture exists to create, and which --spec to pass. See ci-scripts/
# README.md ("Cluster & Test-Engine Resolution") for the cluster/test-engine
# side of this resolution.
#
# Every threshold below reflects an actual difference in each CNV pin
# version's own checked-out cypress/ tree, not a guess:
#
# - release-4.20 and any unknown/unpinned CNV version hardcode TEST_NS/
#   TEST_SECRET_NAME as literal constants (not read from Cypress.env(...)),
#   so same-cluster runs of that case must share one fixed namespace and are
#   serialized by the caller's concurrency lock (needs_lock=true).
#   release-4.21 and later read both dynamically, so they get a genuine
#   per-run namespace and no lock (needs_lock=false).
# - cypress/fixtures/secret.yaml only exists from release-4.19 onward;
#   earlier branches have no secret concept in their Cypress content at all
#   (needs_secret=false -- the caller should skip creating one).
# - The Cypress spec entrypoint layout differs by era: release-4.11-4.17
#   have no aggregator file (plain .spec.ts files -- omit --spec and let
#   cypress.json's default pick them all up); release-4.18 has
#   tests/all.cy.ts; release-4.19 has tests/gating.cy.ts with no tier1
#   split; release-4.20 and later have both tests/gating.cy.ts and
#   tests/tier1.cy.ts, selected via TEST_PROJECT.
#
# Env:
#   CNV_PIN_VERSION - CNV version pinned for this cluster (e.g. 4.20,
#                     4.21, 4.22), from hot-cluster-e2e.yml's prepare job.
#                     Empty for an unpinned/standalone dispatch.
#   RUN_ID          - Unique run identifier (github.run_id) used to build
#                     a genuinely unique namespace/secret name.
#   TEST_PROJECT    - 'gating' or 'features'. Only affects spec selection
#                     on release-4.20 and later. Defaults to 'gating'.
#
# Usage: CNV_PIN_VERSION=4.21 RUN_ID=123 TEST_PROJECT=gating ./ci-scripts/hot-cluster/resolve-cypress-env-vars.sh >> "$GITHUB_OUTPUT"

CNV_PIN_VERSION="${CNV_PIN_VERSION:-}"
RUN_ID="${RUN_ID:?RUN_ID is required}"
TEST_PROJECT="${TEST_PROJECT:-gating}"

# 0 for unpinned/garbage input -- falls into the oldest (safest) band for
# every threshold below.
VERSION_NUM=0
if [[ "${CNV_PIN_VERSION}" =~ ^([0-9]+)\.([0-9]+)$ ]]; then
  VERSION_NUM=$(( 10#${BASH_REMATCH[1]} * 1000 + 10#${BASH_REMATCH[2]} ))
fi

# First CNV pin version whose checked-out Cypress content reads TEST_NS/
# TEST_SECRET_NAME dynamically via Cypress.env(...).
FIRST_DYNAMIC_NS=$(( 4 * 1000 + 21 ))

if (( VERSION_NUM >= FIRST_DYNAMIC_NS )); then
  TEST_NS="auto-test-ns-${RUN_ID}"
  TEST_SECRET_NAME="auto-test-secret-${RUN_ID}"
  NEEDS_LOCK="false"
  echo "CNV pin '${CNV_PIN_VERSION}' reads Cypress namespaces dynamically -> unique '${TEST_NS}', unlocked" >&2
else
  TEST_NS="auto-test-ns"
  TEST_SECRET_NAME="auto-test-secret"
  NEEDS_LOCK="true"
  echo "CNV pin '${CNV_PIN_VERSION:-unpinned}' predates dynamic Cypress namespaces -> fixed '${TEST_NS}', locked" >&2
fi

# cypress/fixtures/secret.yaml exists from 4.19 onward.
FIRST_WITH_SECRET=$(( 4 * 1000 + 19 ))
if (( VERSION_NUM >= FIRST_WITH_SECRET )); then
  NEEDS_SECRET="true"
else
  NEEDS_SECRET="false"
fi

# Spec entrypoint, oldest to newest checked-out layout.
FIRST_WITH_ALL_FILE=$(( 4 * 1000 + 18 ))
FIRST_WITH_GATING_FILE=$(( 4 * 1000 + 19 ))
FIRST_WITH_TIER1_SPLIT=$(( 4 * 1000 + 20 ))

if (( VERSION_NUM >= FIRST_WITH_TIER1_SPLIT )); then
  SPEC="tests/gating.cy.ts"
  [[ "${TEST_PROJECT}" == "features" ]] && SPEC="tests/tier1.cy.ts"
elif (( VERSION_NUM >= FIRST_WITH_GATING_FILE )); then
  SPEC="tests/gating.cy.ts"
elif (( VERSION_NUM >= FIRST_WITH_ALL_FILE )); then
  SPEC="tests/all.cy.ts"
else
  SPEC=""
fi
echo "CNV pin '${CNV_PIN_VERSION:-unpinned}' -> needs_secret=${NEEDS_SECRET}, spec='${SPEC:-<none>}'" >&2

echo "test_ns=${TEST_NS}"
echo "test_secret_name=${TEST_SECRET_NAME}"
echo "needs_lock=${NEEDS_LOCK}"
echo "needs_secret=${NEEDS_SECRET}"
echo "spec=${SPEC}"
