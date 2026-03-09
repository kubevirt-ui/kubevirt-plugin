#! /bin/bash
#
# Start the "off cluster" console.  Based on the `route-console.sh` and `start-console.sh` scripts.
#
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

RUNTIME=$(command -v podman || command -v docker)

# ---------------------------------------------------------------------------
# Route + BRIDGE_PLUGIN_PROXY (same behavior as route-console.sh)
# ---------------------------------------------------------------------------
ROUTE_NAME="kubevirt-apiserver-proxy"
ROUTE_NS="openshift-cnv"
APPS_DOMAIN="$(oc get ingress.config.openshift.io/cluster -o jsonpath='{.spec.domain}' 2>/dev/null || true)"
HOSTNAME="kubevirt-apiserver-proxy.${APPS_DOMAIN}"

if oc get route "$ROUTE_NAME" -n "$ROUTE_NS" &>/dev/null; then
  echo "Route '${ROUTE_NAME}' already exists in namespace '${ROUTE_NS}'."
else
  echo "Route '${ROUTE_NAME}' not found; creating..."
  if {
    echo "apiVersion: route.openshift.io/v1"
    echo "kind: Route"
    echo "metadata:"
    echo "  name: ${ROUTE_NAME}"
    echo "  namespace: ${ROUTE_NS}"
    echo "  annotations:"
    echo "    haproxy.router.openshift.io/hsts_header: max-age=31536000;includeSubDomains;preload"
    echo "spec:"
    echo "  host: ${HOSTNAME}"
    echo "  to:"
    echo "    kind: Service"
    echo "    name: ${ROUTE_NAME}-service"
    echo "    weight: 100"
    echo "  port:"
    echo "    targetPort: 8080"
    echo "  tls:"
    echo "    termination: reencrypt"
    echo "  wildcardPolicy: None"
  } | oc create -f -
  then
    echo "Route '${ROUTE_NAME}' created (host: ${HOSTNAME})."
  else
    echo "Route create skipped or failed (may already exist)."
  fi
  oc get route "$ROUTE_NAME" -n "$ROUTE_NS" &>/dev/null || echo "::warning::Route '${ROUTE_NAME}' is not present; kubevirt API proxy may not work."
fi

if [[ "${PROXY_ENV:-production}" == "local" ]]; then
  echo "PROXY_ENV=local — kubevirt proxy via host.docker.internal (same as route-console.sh + docker)."
  ENDPOINT="http://host.docker.internal:8080"
else
  echo "Using cluster route for kubevirt-apiserver-proxy."
  ENDPOINT="https://${HOSTNAME}"
fi

BRIDGE_PLUGIN_PROXY="$(jq -nc \
  --arg endpoint "$ENDPOINT" \
  '{"services":[{"consoleAPIPath":"/api/proxy/plugin/kubevirt-plugin/kubevirt-apiserver-proxy/","endpoint":$endpoint,"authorize":true}]}')"

echo "BRIDGE_PLUGIN_PROXY (structure): $(echo "$BRIDGE_PLUGIN_PROXY" | jq .)"

# ---------------------------------------------------------------------------
# BRIDGE_* — off-cluster console (kubevirt-plugin only; no extra dev plugins)
# ---------------------------------------------------------------------------
BRIDGE_USER_AUTH="disabled"
BRIDGE_K8S_MODE="off-cluster"
BRIDGE_K8S_AUTH="bearer-token"
BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS="true"
BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT="$(oc whoami --show-server)"
BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS="$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}' 2>/dev/null || true)"
BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER="$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}' 2>/dev/null || true)"
BRIDGE_USER_SETTINGS_LOCATION="localstorage"
BRIDGE_I18N_NAMESPACES="plugin__kubevirt-plugin"

BRIDGE_K8S_AUTH_BEARER_TOKEN="$(oc whoami --show-token 2>/dev/null || true)"
if [[ -z "${BRIDGE_K8S_AUTH_BEARER_TOKEN}" ]]; then
  echo "::error::Could not read bearer token (oc whoami --show-token)."
  exit 1
fi
echo "::add-mask::${BRIDGE_K8S_AUTH_BEARER_TOKEN}"

# Plugin listens on HTTPS :9443 (see default.conf), published as host :9001. Console runs
# in Docker; reach the host via host.docker.internal (Linux: --add-host below).
# Off-cluster bridge uses InsecureSkipVerify for plugin proxy TLS when
# BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true, so the CI self-signed cert is accepted.
BRIDGE_PLUGINS="kubevirt-plugin=https://host.docker.internal:9001"

# ---------------------------------------------------------------------------
# Job summary (no secrets)
# ---------------------------------------------------------------------------
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "<details><summary>Off-cluster console (CI)</summary>"
    echo ""
    echo "| Item | Value |"
    echo "|------|-------|"
    echo "| Console image | \`${CONSOLE_IMAGE}\` |"
    echo "| Console URL | \`http://localhost:${CONSOLE_PORT}\` |"
    echo "| API server | \`${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT}\` |"
    echo "| Thanos URL | \`${BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS:-(empty)}\` |"
    echo "| Alertmanager URL | \`${BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER:-(empty)}\` |"
    echo "| PROXY_ENV | \`${PROXY_ENV:-production}\` |"
    echo "| Proxy endpoint (kubevirt-apiserver-proxy) | \`${ENDPOINT}\` |"
    echo "| Route host | \`${HOSTNAME}\` |"
    echo "| Container runtime | Docker |"
    echo "| BRIDGE_PLUGINS | \`${BRIDGE_PLUGINS}\` |"
    echo "| BRIDGE_PLUGIN_PROXY | \`$(echo "$BRIDGE_PLUGIN_PROXY" | jq -c .)\` |"
    echo ""
    echo "</details>"
  } >> "${GITHUB_STEP_SUMMARY}"
fi

echo "Starting console container..."
echo "  API server: ${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT}"
echo "  Console image: ${CONSOLE_IMAGE}"

DOCKER_RUN_EXTRA=()
if [[ "$(uname -s)" == "Linux" ]]; then
  DOCKER_RUN_EXTRA+=(--add-host=host.docker.internal:host-gateway)
fi

docker run -d --pull=always --rm "${DOCKER_RUN_EXTRA[@]}" \
  -p "${CONSOLE_PORT}:9000" \
  --name console \
  -e BRIDGE_USER_AUTH="${BRIDGE_USER_AUTH}" \
  -e BRIDGE_K8S_MODE="${BRIDGE_K8S_MODE}" \
  -e BRIDGE_K8S_AUTH="${BRIDGE_K8S_AUTH}" \
  -e BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS="${BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS}" \
  -e BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT="${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT}" \
  -e BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS="${BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS}" \
  -e BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER="${BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER}" \
  -e BRIDGE_K8S_AUTH_BEARER_TOKEN="${BRIDGE_K8S_AUTH_BEARER_TOKEN}" \
  -e BRIDGE_USER_SETTINGS_LOCATION="${BRIDGE_USER_SETTINGS_LOCATION}" \
  -e BRIDGE_I18N_NAMESPACES="${BRIDGE_I18N_NAMESPACES}" \
  -e BRIDGE_PLUGIN_PROXY="${BRIDGE_PLUGIN_PROXY}" \
  -e BRIDGE_PLUGINS="${BRIDGE_PLUGINS}" \
  "${CONSOLE_IMAGE}"
