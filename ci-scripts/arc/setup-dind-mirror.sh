#!/bin/bash
#
# OpenShift only: mirror docker:dind into the internal registry for ARC (avoids Docker Hub
# rate limits on the chart's hardcoded docker:dind image). Writes
# ci-scripts/generated/arc-dind-replace.env for Helm post-rendering in ci-scripts/arc/install-runner-scale-set.sh.
#
# Optional environment variables:
#   ARC_RUNNERS_NS   (default: arc-runners)
#   SKIP_DIND_MIRROR (default: 0) — set to 1 to skip mirroring and remove stale arc-dind-replace.env
#   DIND_SOURCE_IMAGE (default: docker.io/library/docker:dind) — source for oc import-image
#
# Requires: oc logged into OpenShift.
# Note: import-image pulls from Docker Hub server-side; rate limits may require cluster pull secrets.

set -euo pipefail
ARC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_SCRIPTS_DIR="$(cd "${ARC_DIR}/.." && pwd)"

ARC_RUNNERS_NS="${ARC_RUNNERS_NS:-arc-runners}"
GENERATED_DIR="${CI_SCRIPTS_DIR}/generated"
SKIP_DIND_MIRROR="${SKIP_DIND_MIRROR:-0}"
DIND_SOURCE_IMAGE="${DIND_SOURCE_IMAGE:-docker.io/library/docker:dind}"
DIND_INTERNAL_REF="image-registry.openshift-image-registry.svc:5000/${ARC_RUNNERS_NS}/arc-docker-dind:dind"

if ! oc get clusterversion version &>/dev/null; then
  echo "ERROR: OpenShift cluster required (clusterversion.version not found)."
  exit 1
fi

echo "=== Mirror docker:dind for ARC (internal registry) ==="
echo "  ARC_RUNNERS_NS: ${ARC_RUNNERS_NS}"
echo "  From:           ${DIND_SOURCE_IMAGE}"
echo "  To ISTag:       arc-docker-dind:dind → ${DIND_INTERNAL_REF}"
echo ""

oc create namespace "${ARC_RUNNERS_NS}" --dry-run=client -o yaml | oc apply -f -
mkdir -p "${GENERATED_DIR}"

if [[ "${SKIP_DIND_MIRROR}" == "1" ]]; then
  echo "SKIP_DIND_MIRROR=1 — skipping docker:dind mirror (removing stale post-render config if any)."
  rm -f "${GENERATED_DIR}/arc-dind-replace.env"
  echo "=== setup-dind-mirror complete (skipped) ==="
  exit 0
fi

if oc import-image arc-docker-dind:dind --from="${DIND_SOURCE_IMAGE}" --confirm -n "${ARC_RUNNERS_NS}"; then
  printf 'ARC_DIND_INTERNAL_IMAGE=%s\n' "${DIND_INTERNAL_REF}" > "${GENERATED_DIR}/arc-dind-replace.env"
  echo "Wrote ${GENERATED_DIR}/arc-dind-replace.env"
  echo "  ci-scripts/arc/install-runner-scale-set.sh will use arc-dind-post-render.sh when this file exists."
  echo ""
  echo "DIND_IMAGE_REF=${DIND_INTERNAL_REF}"
else
  echo "ERROR: oc import-image failed (Docker Hub rate limit or cluster cannot pull docker.io?)."
  echo "  Configure a cluster pull secret for docker.io, set DIND_SOURCE_IMAGE, or SKIP_DIND_MIRROR=1 if dind is mirrored elsewhere (e.g. ImageContentSourcePolicy)."
  exit 1
fi

echo "=== setup-dind-mirror complete ==="
