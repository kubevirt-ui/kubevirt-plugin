#!/usr/bin/env bash
set -euo pipefail

# Emits cluster_name=... and openshift_version=... for GITHUB_OUTPUT.
#
# Automatic pull_request_target runs against a release-<major>.<minor>
# branch get a dedicated, version-matched cluster (kubevirt-plugin-<major><minor>)
# instead of silently colliding with main's kubevirt-plugin-ci cluster. Any
# other base branch, and every workflow_dispatch run, falls back to the
# provided input (or the repo's long-standing default).
#
# Env:
#   EVENT_NAME              - github.event_name (e.g. pull_request_target, workflow_dispatch)
#   BASE_REF                - github.base_ref (PR target branch, e.g. release-4.20)
#   INPUT_CLUSTER_NAME       - workflow_dispatch inputs.cluster_name, if set
#   INPUT_OPENSHIFT_VERSION  - workflow_dispatch inputs.openshift_version, if set
#
# Usage (from a workflow step):
#   ./ci-scripts/hot-cluster/resolve-cluster-config.sh >> "$GITHUB_OUTPUT"

DEFAULT_CLUSTER_NAME="kubevirt-plugin-ci"
DEFAULT_OPENSHIFT_VERSION="4.22_openshift"

EVENT_NAME="${EVENT_NAME:-}"
BASE_REF="${BASE_REF:-}"
INPUT_CLUSTER_NAME="${INPUT_CLUSTER_NAME:-}"
INPUT_OPENSHIFT_VERSION="${INPUT_OPENSHIFT_VERSION:-}"

if [[ "${EVENT_NAME}" == "pull_request_target" && "${BASE_REF}" =~ ^release-([0-9]+)\.([0-9]+)$ ]]; then
  MAJOR="${BASH_REMATCH[1]}"
  MINOR="${BASH_REMATCH[2]}"
  CLUSTER_NAME="kubevirt-plugin-${MAJOR}${MINOR}"
  OPENSHIFT_VERSION="${MAJOR}.${MINOR}_openshift"
  echo "Base branch '${BASE_REF}' is a release branch → cluster '${CLUSTER_NAME}' (${OPENSHIFT_VERSION})" >&2
else
  CLUSTER_NAME="${INPUT_CLUSTER_NAME:-${DEFAULT_CLUSTER_NAME}}"
  OPENSHIFT_VERSION="${INPUT_OPENSHIFT_VERSION:-${DEFAULT_OPENSHIFT_VERSION}}"
  echo "Using default/workflow_dispatch cluster config: '${CLUSTER_NAME}' (${OPENSHIFT_VERSION})" >&2
fi

echo "cluster_name=${CLUSTER_NAME}"
echo "openshift_version=${OPENSHIFT_VERSION}"
