#!/bin/bash
#
# CI tool download helpers. Source this file in scripts that need helm, kubectl,
# oc, or virtctl. Use ensure_* functions to install missing tools into
# CI_TOOLS_DIR (default: same dir as this script /_ci_tools).
#
# Environment variables (all optional; defaults shown):
#   CI_TOOLS_DIR     - Directory for downloaded binaries (default: <script-dir>/_ci_tools)
#   HELM_VERSION     - Helm version (default: v3.16.3)
#   KUBECTL_VERSION  - kubectl version or "stable" (default: stable)
#   OC_VERSION       - OpenShift client version, e.g. 4.20 (default: 4.20)
#   VIRTCTL_VERSION  - virtctl version (default: v1.4.0)
#   CI_ARCH          - Architecture for binaries: amd64 or arm64 (default: amd64)
#
# Functions (optional first argument overrides the corresponding env var):
#   ensure_helm [version]
#   ensure_kubectl [version]
#   ensure_oc [version]
#   ensure_virtctl [version]
#   ensure_all_ci_tools
#
# Example:
#   source "$(dirname "${BASH_SOURCE[0]}")/ci-tools.sh"
#   ensure_helm
#   ensure_oc
#

# --- Defaults (env vars always available when this file is sourced) ---
_CI_TOOLS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)"
export CI_TOOLS_DIR="${CI_TOOLS_DIR:-${_CI_TOOLS_SCRIPT_DIR}/_ci_tools}"
export HELM_VERSION="${HELM_VERSION:-v3.16.3}"
export KUBECTL_VERSION="${KUBECTL_VERSION:-stable}"
export OC_VERSION="${OC_VERSION:-4.20}"
export VIRTCTL_VERSION="${VIRTCTL_VERSION:-v1.4.0}"
export CI_ARCH="${CI_ARCH:-amd64}"

# Ensure CI_TOOLS_DIR exists and is on PATH when sourced
mkdir -p "${CI_TOOLS_DIR}"
export PATH="${CI_TOOLS_DIR}:${PATH}"

_ci_tools_download() {
  local url="$1"
  local dest="$2"
  echo "Downloading: ${url}"
  curl -fsSL --retry 3 -o "${dest}" "${url}"
}

_ci_tools_ensure_helm() {
  local version="${1:-${HELM_VERSION}}"
  local binary="${CI_TOOLS_DIR}/helm"
  if [[ -x "${binary}" ]]; then
    return 0
  fi
  local tarball="${CI_TOOLS_DIR}/helm-${version}.tar.gz"
  local url="https://get.helm.sh/helm-${version}-linux-${CI_ARCH}.tar.gz"
  _ci_tools_download "${url}" "${tarball}"
  tar -xzf "${tarball}" -C "${CI_TOOLS_DIR}" --strip-components=1 "linux-${CI_ARCH}/helm"
  rm -f "${tarball}"
  chmod +x "${binary}"
}

_ci_tools_ensure_kubectl() {
  local version="${1:-${KUBECTL_VERSION}}"
  local binary="${CI_TOOLS_DIR}/kubectl"
  if [[ -x "${binary}" ]]; then
    return 0
  fi
  if [[ "${version}" == "stable" ]]; then
    version="$(curl -fsSL https://dl.k8s.io/release/stable.txt)"
  fi
  local url="https://dl.k8s.io/release/${version}/bin/linux/${CI_ARCH}/kubectl"
  _ci_tools_download "${url}" "${binary}"
  chmod +x "${binary}"
}

_ci_tools_ensure_oc() {
  local version="${1:-${OC_VERSION}}"
  local binary="${CI_TOOLS_DIR}/oc"
  if [[ -x "${binary}" ]]; then
    return 0
  fi
  local url="https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable-${version}/openshift-client-linux.tar.gz"
  local tarball="${CI_TOOLS_DIR}/oc-${version}.tar.gz"
  local tmpdir
  tmpdir="$(mktemp -d)"
  _ci_tools_download "${url}" "${tarball}"
  tar -xzf "${tarball}" -C "${tmpdir}"
  mv "${tmpdir}/oc" "${binary}"
  rm -rf "${tmpdir}" "${tarball}"
  chmod +x "${binary}"
}

_ci_tools_ensure_virtctl() {
  local version="${1:-${VIRTCTL_VERSION}}"
  local binary="${CI_TOOLS_DIR}/virtctl"
  if [[ -x "${binary}" ]]; then
    return 0
  fi
  local url="https://github.com/kubevirt/kubevirt/releases/download/${version}/virtctl-${version}-linux-${CI_ARCH}"
  _ci_tools_download "${url}" "${binary}"
  chmod +x "${binary}"
}

ensure_helm() {
  _ci_tools_ensure_helm "${1:-${HELM_VERSION}}"
}

ensure_kubectl() {
  _ci_tools_ensure_kubectl "${1:-${KUBECTL_VERSION}}"
}

ensure_oc() {
  _ci_tools_ensure_oc "${1:-${OC_VERSION}}"
}

ensure_virtctl() {
  _ci_tools_ensure_virtctl "${1:-${VIRTCTL_VERSION}}"
}

ensure_all_ci_tools() {
  ensure_helm
  ensure_kubectl
  ensure_oc
  ensure_virtctl
}
