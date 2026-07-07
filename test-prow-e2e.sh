#!/usr/bin/env bash
# E2E tests have moved to the hot-cluster CI pipeline (hot-cluster-e2e.yml).
# This script is kept as a no-op so the Prow check passes until the job is
# removed from openshift/release.
echo "E2E tests run on hot-cluster CI. Skipping Prow E2E."
exit 0
