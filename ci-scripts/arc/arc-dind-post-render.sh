#!/usr/bin/env bash
# Helm post-renderer for gha-runner-scale-set + containerMode dind on OpenShift.
#
# 1) Optional: replace hardcoded docker:dind with internal registry image when
#    ci-scripts/generated/arc-dind-replace.env exists (setup-dind-mirror.sh, etc.).
# 2) Always: append --storage-driver=vfs to dockerd args so the inner daemon
#    does not use overlay on top of the pod's overlay (containerd EINVAL on mount).
#
# Ref: ARC chart dind args in actions-runner-controller _helpers.tpl (dind-container).
set -euo pipefail
ARC_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ARC_ROOT}/../generated/arc-dind-replace.env"

tmp="$(mktemp)"
trap 'rm -f "${tmp}"' EXIT
cat >"${tmp}"

ARC_DIND_INTERNAL_IMAGE=""
if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck source=/dev/null
  source "${ENV_FILE}"
fi

skip_vfs=0
if grep -q 'storage-driver=vfs' "${tmp}"; then
  skip_vfs=1
fi

while IFS= read -r line || [[ -n "${line}" ]]; do
  if [[ -n "${ARC_DIND_INTERNAL_IMAGE:-}" && "${line}" == *docker:dind* ]]; then
    printf '%s\n' "${line//docker:dind/${ARC_DIND_INTERNAL_IMAGE}}"
    continue
  fi
  if [[ "${skip_vfs}" == 0 && "${line}" =~ ^([[:space:]]*)-\ --group=\$\(DOCKER_GROUP_GID\)$ ]]; then
    printf '%s\n' "${line}"
    printf '%s- --storage-driver=vfs\n' "${BASH_REMATCH[1]}"
    continue
  fi
  printf '%s\n' "${line}"
done <"${tmp}"
