#!/usr/bin/env bash
# ci-env-controller: watches labeled ConfigMaps in the ci-env namespace and
# reconciles CI test environments (namespace, Helm chart) on demand.
#
# Designed to run as a long-lived Deployment pod. The script is mounted via
# a ConfigMap volume so it can be updated without rebuilding the image.
#
# Environment variables (set on the Deployment):
#   CI_ENV_NS              Namespace where trigger ConfigMaps live (default: ci-env)
#   CI_ENV_TTL_SECONDS     Force-clean environments older than this (default: 7200 = 2h)
#   CI_ENV_LABEL           Label selector for trigger ConfigMaps
#   HELM_CHART_PATH        Path to the ci-test-stack Helm chart inside the container

set -uo pipefail

CI_ENV_NS="${CI_ENV_NS:-ci-env}"
CI_ENV_TTL_SECONDS="${CI_ENV_TTL_SECONDS:-7200}"
CI_ENV_LABEL="${CI_ENV_LABEL:-ci.kubevirt-plugin/type=test-environment}"
HELM_CHART_PATH="${HELM_CHART_PATH:-/opt/ci-env/helm/ci-test-stack}"

RUNNER_SA_NAME="${RUNNER_SA_NAME:-kubevirt-plugin-ci-gha-rs-no-permission}"
RUNNER_SA_NS="${RUNNER_SA_NS:-arc-runners}"

CONSOLE_IMAGE_REGISTRY="${CONSOLE_IMAGE_REGISTRY:-quay.io/openshift/origin-console}"

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*"; }

# --------------------------------------------------------------------------- #
#  Cluster discovery (cached per reconciliation cycle)
# --------------------------------------------------------------------------- #
discover_cluster() {
  API_SERVER="${KUBERNETES_SERVICE_HOST:+https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT:-443}}"
  API_SERVER="${API_SERVER:-$(oc whoami --show-server 2>/dev/null || true)}"

  APPS_DOMAIN="$(oc get ingress.config.openshift.io/cluster \
    -o jsonpath='{.spec.domain}' 2>/dev/null || true)"

  THANOS_URL="$(oc -n openshift-config-managed get configmap monitoring-shared-config \
    -o jsonpath='{.data.thanosPublicURL}' 2>/dev/null || true)"

  ALERTMANAGER_URL="$(oc -n openshift-config-managed get configmap monitoring-shared-config \
    -o jsonpath='{.data.alertmanagerPublicURL}' 2>/dev/null || true)"

  if [[ -z "${APPS_DOMAIN}" ]]; then
    log "ERROR: could not discover APPS_DOMAIN from ingress.config.openshift.io/cluster"
    return 1
  fi
  log "Cluster: API_SERVER=${API_SERVER}  APPS_DOMAIN=${APPS_DOMAIN}"
}

# --------------------------------------------------------------------------- #
#  Console image resolution (same logic as resolve-console-image.sh)
# --------------------------------------------------------------------------- #
resolve_console_image() {
  local override="${1:-}"
  if [[ -n "${override}" ]]; then
    echo "${override}"
    return
  fi

  local version
  version="$(oc get clusterversion version \
    -o jsonpath='{.status.desired.version}' 2>/dev/null || true)"
  if [[ -z "${version}" ]]; then
    echo "${CONSOLE_IMAGE_REGISTRY}:latest"
    return
  fi

  local major minor
  IFS='.' read -r major minor _ <<< "${version}"
  echo "${CONSOLE_IMAGE_REGISTRY}:${major}.${minor}"
}

# --------------------------------------------------------------------------- #
#  Ensure kubevirt-apiserver-proxy Route exists
# --------------------------------------------------------------------------- #
ensure_proxy_route() {
  local route_name="kubevirt-apiserver-proxy"
  local route_ns="openshift-cnv"
  local proxy_host="${route_name}.${APPS_DOMAIN}"

  if oc get route "${route_name}" -n "${route_ns}" &>/dev/null; then
    log "Proxy route already exists in ${route_ns}"
  else
    log "Creating proxy route ${route_name} in ${route_ns}..."
    cat <<EOF | oc create -f - 2>/dev/null || log "Proxy route create skipped (may already exist or namespace missing)"
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: ${route_name}
  namespace: ${route_ns}
  annotations:
    haproxy.router.openshift.io/hsts_header: max-age=31536000;includeSubDomains;preload
spec:
  host: ${proxy_host}
  to:
    kind: Service
    name: ${route_name}-service
    weight: 100
  port:
    targetPort: 8080
  tls:
    termination: reencrypt
  wildcardPolicy: None
EOF
  fi

  PLUGIN_PROXY_ENDPOINT="https://${proxy_host}"
}

# --------------------------------------------------------------------------- #
#  Patch ConfigMap helper
# --------------------------------------------------------------------------- #
patch_cm() {
  local name="$1"
  shift
  local patch_data="$*"
  oc patch configmap "${name}" -n "${CI_ENV_NS}" --type merge -p "${patch_data}" 2>/dev/null || true
}

# --------------------------------------------------------------------------- #
#  Provision a test environment
# --------------------------------------------------------------------------- #
provision() {
  local cm_name="$1"
  local plugin_image="$2"
  local test_ns="$3"
  local console_image_override="${4:-}"
  local helm_release_override="${5:-}"

  local helm_release="${helm_release_override:-${cm_name}}"

  log "Provisioning: cm=${cm_name} ns=${test_ns} release=${helm_release}"
  patch_cm "${cm_name}" '{"data":{"status":"provisioning"}}'

  discover_cluster || {
    patch_cm "${cm_name}" '{"data":{"status":"error","error-message":"cluster discovery failed"}}'
    return 1
  }

  local console_image
  console_image="$(resolve_console_image "${console_image_override}")"
  local route_host="console-${cm_name}.${APPS_DOMAIN}"

  ensure_proxy_route

  log "Creating namespace ${test_ns}..."
  oc create namespace "${test_ns}" --dry-run=client -o yaml | oc apply -f - || true

  log "Running helm upgrade --install ${helm_release}..."
  if ! helm upgrade --install "${helm_release}" \
    "${HELM_CHART_PATH}" \
    --namespace "${test_ns}" \
    --set "plugin.image=${plugin_image}" \
    --set "console.image=${console_image}" \
    --set "console.apiServer=${API_SERVER}" \
    --set "console.route.host=${route_host}" \
    --set "console.pluginProxy.endpoint=${PLUGIN_PROXY_ENDPOINT}" \
    --set "console.monitoring.thanosUrl=${THANOS_URL}" \
    --set "console.monitoring.alertmanagerUrl=${ALERTMANAGER_URL}" \
    --set "runner.saName=${RUNNER_SA_NAME}" \
    --set "runner.saNamespace=${RUNNER_SA_NS}" \
    --wait --timeout 5m 2>&1; then

    local err="helm install failed"
    log "ERROR: ${err}"
    patch_cm "${cm_name}" "{\"data\":{\"status\":\"error\",\"error-message\":\"${err}\"}}"
    return 1
  fi

  local bridge_base="http://${helm_release}-console.${test_ns}.svc.cluster.local:9000"
  log "Waiting for console at ${bridge_base}..."
  local ready=false
  for i in $(seq 1 60); do
    if curl -s -o /dev/null -w "%{http_code}" "${bridge_base}/" 2>/dev/null | grep -qE '200|301|302'; then
      ready=true
      break
    fi
    sleep 5
  done

  if [[ "${ready}" != "true" ]]; then
    local err="console did not become ready within 5 minutes"
    log "ERROR: ${err}"
    patch_cm "${cm_name}" "{\"data\":{\"status\":\"error\",\"error-message\":\"${err}\"}}"
    return 1
  fi

  local console_route="https://${route_host}"
  log "Environment ready: bridge=${bridge_base} route=${console_route}"
  patch_cm "${cm_name}" "{\"data\":{\"status\":\"ready\",\"bridge-base-address\":\"${bridge_base}\",\"console-route\":\"${console_route}\"}}"
}

# --------------------------------------------------------------------------- #
#  Tear down a test environment
# --------------------------------------------------------------------------- #
teardown() {
  local cm_name="$1"
  local test_ns="$2"
  local helm_release="${3:-${cm_name}}"

  log "Tearing down: cm=${cm_name} ns=${test_ns} release=${helm_release}"
  patch_cm "${cm_name}" '{"data":{"status":"cleaning"}}'

  helm uninstall "${helm_release}" -n "${test_ns}" --wait 2>/dev/null || true

  oc delete namespace "${test_ns}" --wait=false 2>/dev/null || true

  log "Teardown complete for ${cm_name}"
  patch_cm "${cm_name}" '{"data":{"status":"cleaned"}}'
}

# --------------------------------------------------------------------------- #
#  Reconcile a single ConfigMap
# --------------------------------------------------------------------------- #
reconcile_one() {
  local cm_json="$1"

  local cm_name desired status plugin_image test_ns console_image helm_release
  cm_name="$(echo "${cm_json}" | jq -r '.metadata.name')"
  desired="$(echo "${cm_json}" | jq -r '.data["desired-state"] // "unknown"')"
  status="$(echo "${cm_json}" | jq -r '.data["status"] // ""')"
  plugin_image="$(echo "${cm_json}" | jq -r '.data["plugin-image"] // ""')"
  test_ns="$(echo "${cm_json}" | jq -r '.data["test-namespace"] // ""')"
  console_image="$(echo "${cm_json}" | jq -r '.data["console-image"] // ""')"
  helm_release="$(echo "${cm_json}" | jq -r '.data["helm-release"] // ""')"

  if [[ "${desired}" == "present" && "${status}" != "ready" && "${status}" != "provisioning" ]]; then
    if [[ -z "${plugin_image}" || -z "${test_ns}" ]]; then
      log "WARN: ConfigMap ${cm_name} missing required fields (plugin-image, test-namespace)"
      patch_cm "${cm_name}" '{"data":{"status":"error","error-message":"missing required fields: plugin-image and test-namespace"}}'
      return
    fi
    if ! provision "${cm_name}" "${plugin_image}" "${test_ns}" "${console_image}" "${helm_release}"; then
      log "ERROR: provision failed for ${cm_name}, ensuring status=error"
      local cur_status
      cur_status="$(oc get configmap "${cm_name}" -n "${CI_ENV_NS}" -o jsonpath='{.data.status}' 2>/dev/null || echo "")"
      if [[ "${cur_status}" != "error" ]]; then
        patch_cm "${cm_name}" '{"data":{"status":"error","error-message":"provision failed unexpectedly"}}'
      fi
    fi

  elif [[ "${desired}" == "absent" && "${status}" != "cleaned" && "${status}" != "cleaning" ]]; then
    if [[ -z "${test_ns}" ]]; then
      log "WARN: ConfigMap ${cm_name} missing test-namespace for teardown"
      patch_cm "${cm_name}" '{"data":{"status":"cleaned"}}'
      return
    fi
    teardown "${cm_name}" "${test_ns}" "${helm_release}" || \
      log "WARN: teardown encountered errors for ${cm_name} (non-fatal)"
  fi
}

# --------------------------------------------------------------------------- #
#  Stale environment reaper
# --------------------------------------------------------------------------- #
reap_stale() {
  local now_epoch
  now_epoch="$(date +%s)"

  local cms
  cms="$(oc get configmap -n "${CI_ENV_NS}" -l "${CI_ENV_LABEL}" -o json 2>/dev/null || echo '{"items":[]}')"

  echo "${cms}" | jq -c '.items[]' 2>/dev/null | while IFS= read -r cm; do
    local cm_name desired status created_ts
    cm_name="$(echo "${cm}" | jq -r '.metadata.name')"
    desired="$(echo "${cm}" | jq -r '.data["desired-state"] // ""')"
    status="$(echo "${cm}" | jq -r '.data["status"] // ""')"
    created_ts="$(echo "${cm}" | jq -r '.metadata.creationTimestamp // ""')"

    if [[ "${desired}" != "present" || "${status}" == "cleaning" || "${status}" == "cleaned" ]]; then
      continue
    fi

    if [[ -n "${created_ts}" ]]; then
      local created_epoch
      created_epoch="$(date -d "${created_ts}" +%s 2>/dev/null || echo 0)"
      local age=$(( now_epoch - created_epoch ))
      if (( age > CI_ENV_TTL_SECONDS )); then
        log "REAPER: ConfigMap ${cm_name} is ${age}s old (TTL=${CI_ENV_TTL_SECONDS}s), forcing cleanup"
        local test_ns helm_release
        test_ns="$(echo "${cm}" | jq -r '.data["test-namespace"] // ""')"
        helm_release="$(echo "${cm}" | jq -r '.data["helm-release"] // ""')"
        teardown "${cm_name}" "${test_ns}" "${helm_release}"
      fi
    fi
  done
}

# --------------------------------------------------------------------------- #
#  Main watch loop
# --------------------------------------------------------------------------- #
main() {
  log "ci-env-controller starting"
  log "  CI_ENV_NS=${CI_ENV_NS}"
  log "  CI_ENV_TTL_SECONDS=${CI_ENV_TTL_SECONDS}"
  log "  CI_ENV_LABEL=${CI_ENV_LABEL}"
  log "  HELM_CHART_PATH=${HELM_CHART_PATH}"

  local reap_interval=300
  local last_reap=0

  while true; do
    local now
    now="$(date +%s)"
    if (( now - last_reap > reap_interval )); then
      reap_stale
      last_reap="${now}"
    fi

    local cms
    cms="$(oc get configmap -n "${CI_ENV_NS}" -l "${CI_ENV_LABEL}" -o json 2>/dev/null || echo '{"items":[]}')"

    echo "${cms}" | jq -c '.items[]' 2>/dev/null | while IFS= read -r cm; do
      reconcile_one "${cm}"
    done

    sleep 10
  done
}

main "$@"
