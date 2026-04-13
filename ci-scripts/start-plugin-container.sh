#! /bin/bash
set -euox pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# ARC jobs use Docker-in-Docker (DOCKER_HOST); prefer docker so ports publish on the dind host.
# If podman is also on PATH, `podman || docker` would bypass the daemon jobs use for `docker run`.
if [[ -n "${DOCKER_HOST:-}" ]] && command -v docker &>/dev/null; then
  RUNTIME=$(command -v docker)
elif command -v podman &>/dev/null; then
  RUNTIME=$(command -v podman)
else
  RUNTIME=$(command -v docker)
fi

# :z is for Podman SELinux; plain Docker (incl. dind) uses :ro only.
VOL_SUFFIX=":ro"
[[ "${RUNTIME}" == *podman ]] && VOL_SUFFIX=":ro,z"

#
# If the PLUGIN_IMAGE is not set, build it locally.
#
if [[ -z "${PLUGIN_IMAGE:-}" ]]; then
  PLUGIN_IMAGE="localhost/kubevirt-plugin:local"
  $RUNTIME build -t "${PLUGIN_IMAGE}" -f Dockerfile "${REPO_ROOT}"
fi

PLUGIN_NAME=${PLUGIN_NAME:-kubevirt-plugin-ci}
PLUGIN_PORT=${PLUGIN_PORT:-9001}
PLUGIN_TRANSPORT=${PLUGIN_TRANSPORT:-http}

echo "Using PLUGIN_IMAGE: ${PLUGIN_IMAGE}"
echo "Using PLUGIN_NAME: ${PLUGIN_NAME}"
echo "Using PLUGIN_PORT: ${PLUGIN_PORT}"
echo "Using PLUGIN_TRANSPORT: ${PLUGIN_TRANSPORT}"

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "<details><summary>Kubevirt Plugin Container</summary>"
    echo ""
    echo "| Item | Value |"
    echo "|------|-------|"
    echo "| Plugin image | \`${PLUGIN_IMAGE}\` |"
    echo "| Plugin port | \`${PLUGIN_PORT}\` |"
    echo "| Plugin transport | \`${PLUGIN_TRANSPORT}\` |"
    echo "| Container name | \`${PLUGIN_NAME}\` |"
    echo "| Container runtime | \`${RUNTIME}\` |"
    echo ""
    echo "</details>"
  } >> "${GITHUB_STEP_SUMMARY}"
fi

CERT_CONFIG=""
if [[ "${PLUGIN_TRANSPORT}" == "https" ]]; then
  #
  # Create the self-signed certs
  #
  # With Docker-in-Docker (ARC), bind-mount sources must exist on the docker *daemon* host. Paths under
  # $TMPDIR (e.g. /home/runner/.tmp) are often not shared with dind, so the mount appears empty in the
  # container and nginx fails: cannot load certificate "/var/serving-cert/tls.crt". Use the workspace.
  #
  CERT_PARENT="${REPO_ROOT}/ci-scripts/generated"
  mkdir -p "${CERT_PARENT}" || true
  KUBEVIRT_PLUGIN_CERT_DIR=$(mktemp -d "${CERT_PARENT}/.tmp-plugin-cert.XXXXXX")
  openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
    -keyout "${KUBEVIRT_PLUGIN_CERT_DIR}/tls.key" \
    -out "${KUBEVIRT_PLUGIN_CERT_DIR}/tls.crt" \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:host.docker.internal"
  chmod a+rx "${KUBEVIRT_PLUGIN_CERT_DIR}"
  chmod a+r "${KUBEVIRT_PLUGIN_CERT_DIR}/tls.crt" "${KUBEVIRT_PLUGIN_CERT_DIR}/tls.key"

  CERT_CONFIG="-v ${KUBEVIRT_PLUGIN_CERT_DIR}:/var/serving-cert${VOL_SUFFIX}"
fi

CONTAINER_CONFIG=${SCRIPT_DIR}/nginx-9080.conf
CONTAINER_PORT=9080
if [[ "${PLUGIN_TRANSPORT}" == "https" ]]; then
  CONTAINER_CONFIG=${SCRIPT_DIR}/nginx-9443.conf
  CONTAINER_PORT=9443
fi

#
# Start the plugin container with the self-signed certs and nginx `nginx-9443.conf` config
# mounted into the container.  This emulates how the pod is deployed with the kubevirt operator
# using a ConfigMap and Secrets mounted into the container.
#
$RUNTIME rm -f "${PLUGIN_NAME}" 2>/dev/null || true
$RUNTIME run -d \
  --name "${PLUGIN_NAME}" \
  -p "${PLUGIN_PORT}:${CONTAINER_PORT}" \
  -v "${CONTAINER_CONFIG}:/etc/nginx/nginx.conf${VOL_SUFFIX}" \
  ${CERT_CONFIG} \
  "${PLUGIN_IMAGE}"

#
# Note: If this run with podman, the IPv6 port is captured but not mapped to nginx.  So,
#       using localhost:${PLUGIN_PORT} may not work. Use 127.0.0.1:${PLUGIN_PORT} instead.
#
