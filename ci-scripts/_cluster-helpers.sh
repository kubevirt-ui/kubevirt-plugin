#!/bin/bash
#
# Resolve CLI binary download URLs from a live OpenShift cluster.
#
# Source this file; do not execute it directly.
#   source "$(dirname "${BASH_SOURCE[0]}")/_cluster-helpers.sh"
#
# After sourcing, call:
#   resolve_cli_downloads           # populates OC_URL, VIRTCTL_URL, HELM_URL
#   resolve_oc_version              # populates OC_VERSION (if not already set)
#   resolve_internal_registry       # populates INTERNAL_REGISTRY
#
# The functions use ConsoleCLIDownload resources and rewrite public route URLs
# to cluster-internal service URLs so build pods don't need to trust the
# cluster's self-signed ingress CA.
#
# Requires: oc logged into OpenShift.
# Optional: jq (URL resolution is silently skipped without it).

verify_oc() {
  if ! oc get clusterversion version &>/dev/null; then
    echo "ERROR: OpenShift cluster required (clusterversion.version not found)."
    exit 1
  fi
}

# Rewrite a public https route URL to its backing cluster-internal HTTP service.
# Arg: $1 = URL   Reads: _ALL_ROUTES_JSON (set by resolve_cli_downloads)
_route_url_to_internal() {
  local url="${1}"
  [[ -z "${url}" ]] && return
  local host path route_info ns svc svc_port
  host=$(echo "${url}" | sed -E 's|https://([^/]+).*|\1|')
  path=$(echo "${url}" | sed -E 's|https://[^/]+(/.*)?|\1|' || echo '/')
  route_info=$(echo "${_ALL_ROUTES_JSON}" \
    | jq -r --arg h "${host}" \
        '.items[] | select(.spec.host == $h) | "\(.metadata.namespace) \(.spec.to.name)"' \
    | head -1)
  if [[ -n "${route_info}" ]]; then
    read -r ns svc <<< "${route_info}"
    svc_port=$(oc get service "${svc}" -n "${ns}" \
      -o jsonpath='{.spec.ports[0].port}' 2>/dev/null || echo "8080")
    echo "http://${svc}.${ns}.svc.cluster.local:${svc_port}${path}"
  else
    echo "${url}"
  fi
}

# Detect OC_VERSION from the cluster if not already set.
# Sets OC_VERSION; defaults to 4.20 if detection fails.
resolve_oc_version() {
  if [[ -n "${OC_VERSION:-}" ]]; then
    return
  fi
  OC_VERSION=$(oc version --output json 2>/dev/null \
    | jq -r '.openshiftVersion | split(".") | .[0:2] | join(".") // empty') || true
  OC_VERSION="${OC_VERSION:-4.20}"
}

# Resolve the internal image registry hostname from the cluster.
# Sets INTERNAL_REGISTRY; defaults to the well-known service address if detection fails.
resolve_internal_registry() {
  INTERNAL_REGISTRY="$(oc get image.config.openshift.io/cluster \
    -o jsonpath='{.status.internalRegistryHostname}' 2>/dev/null \
    || echo 'image-registry.openshift-image-registry.svc:5000')"
}

# Resolve binary download URLs from ConsoleCLIDownload resources.
# Sets: OC_URL, VIRTCTL_URL, HELM_URL (empty string if not resolved).
# Callers can choose which variables they need; unused ones remain empty.
resolve_cli_downloads() {
  OC_URL=""
  VIRTCTL_URL=""
  HELM_URL=""

  if ! command -v jq &>/dev/null; then
    return
  fi

  local cli_json
  cli_json=$(oc get consoleclidownload -o json 2>/dev/null || true)
  if [[ -z "${cli_json}" ]]; then
    return
  fi

  OC_URL=$(echo "${cli_json}" \
    | jq -r '.items[].spec.links[] | select(.text | test("oc.*linux.*x86_64|oc.*linux.*amd64"; "i")) | .href' \
    | head -1)
  VIRTCTL_URL=$(echo "${cli_json}" \
    | jq -r '.items[].spec.links[] | select(.text | test("virtctl.*linux.*amd64|virtctl.*linux.*x86_64"; "i")) | .href' \
    | head -1 || true)
  HELM_URL=$(echo "${cli_json}" \
    | jq -r '.items[].spec.links[] | select(.text | test("helm.*linux.*amd64|helm.*linux.*x86_64"; "i")) | .href' \
    | head -1 || true)

  _ALL_ROUTES_JSON=$(oc get route --all-namespaces -o json 2>/dev/null || true)
  [[ -n "${OC_URL}" ]]      && OC_URL=$(_route_url_to_internal "${OC_URL}")
  [[ -n "${VIRTCTL_URL}" ]] && VIRTCTL_URL=$(_route_url_to_internal "${VIRTCTL_URL}")
  [[ -n "${HELM_URL}" ]]    && HELM_URL=$(_route_url_to_internal "${HELM_URL}")
  unset _ALL_ROUTES_JSON
}
