#!/usr/bin/env bash
# Emit CONSOLE_IMAGE=... for GITHUB_ENV so off-cluster console matches the cluster's OpenShift x.y.
# Requires: oc logged in; OpenShift cluster with ClusterVersion.
set -euo pipefail

CONSOLE_IMAGE_REGISTRY="${CONSOLE_IMAGE_REGISTRY:-quay.io/openshift/origin-console}"
CONSOLE_IMAGE_DEFAULT_TAG="${CONSOLE_IMAGE_DEFAULT_TAG:-latest}"

if [[ -n "${CONSOLE_IMAGE:-}" ]]; then
  echo "CONSOLE_IMAGE already set (${CONSOLE_IMAGE}); skipping cluster version lookup." >&2
  echo "CONSOLE_IMAGE=${CONSOLE_IMAGE}"
  exit 0
fi

CONSOLE_IMAGE_SKIP_DETECTION="${CONSOLE_IMAGE_SKIP_DETECTION:-false}"
if [[ "${CONSOLE_IMAGE_SKIP_DETECTION}" == "true" ]]; then
  CONSOLE_IMAGE="${CONSOLE_IMAGE_REGISTRY}:${CONSOLE_IMAGE_DEFAULT_TAG}"
  echo "Auto-detection disabled; using ${CONSOLE_IMAGE}" >&2
  echo "CONSOLE_IMAGE=${CONSOLE_IMAGE}"
  exit 0
fi

VERSION="$(oc get clusterversion version -o jsonpath='{.status.desired.version}' 2>/dev/null || true)"
if [[ -z "${VERSION}" ]]; then
  if [[ -n "${CI:-}" ]]; then
    echo "::error::Could not read .status.desired.version from ClusterVersion 'version'. Is this an OpenShift cluster and is oc authenticated?" >&2
    exit 1
  fi
  CONSOLE_IMAGE="${CONSOLE_IMAGE_REGISTRY}:${CONSOLE_IMAGE_DEFAULT_TAG}"
  echo "Could not detect cluster version; falling back to ${CONSOLE_IMAGE}" >&2
  echo "CONSOLE_IMAGE=${CONSOLE_IMAGE}"
  exit 0
fi

IFS='.' read -r major minor _rest <<< "${VERSION}"
if [[ -z "${major:-}" || -z "${minor:-}" ]]; then
  if [[ -n "${CI:-}" ]]; then
    echo "::error::Could not parse OpenShift version '${VERSION}' as major.minor.*" >&2
    exit 1
  fi
  CONSOLE_IMAGE="${CONSOLE_IMAGE_REGISTRY}:${CONSOLE_IMAGE_DEFAULT_TAG}"
  echo "Could not parse cluster version '${VERSION}'; falling back to ${CONSOLE_IMAGE}" >&2
  echo "CONSOLE_IMAGE=${CONSOLE_IMAGE}"
  exit 0
fi

OCP_XY="${major}.${minor}"
CONSOLE_IMAGE="${CONSOLE_IMAGE_REGISTRY}:${OCP_XY}"

echo "Cluster OpenShift version: ${VERSION} → console tag: ${OCP_XY}" >&2
echo "CONSOLE_IMAGE=${CONSOLE_IMAGE}"

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "### Off-cluster console image"
    echo ""
    echo "Cluster version: **${VERSION}**"
    echo "Console image: \`${CONSOLE_IMAGE}\`"
  } >> "${GITHUB_STEP_SUMMARY}"
fi
