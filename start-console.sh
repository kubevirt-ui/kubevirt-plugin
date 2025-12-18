#!/bin/sh
set -eu

source ./route-console.sh

# Define plugins (name=url)
plugins="
monitoring-plugin=https://github.com/openshift/monitoring-plugin.git
networking-console-plugin=https://github.com/openshift/networking-console-plugin.git
"

# Plugin URLs per container runtime
running_podman_linux="kubevirt-plugin=http://localhost:9001"
running_podman="kubevirt-plugin=http://host.containers.internal:9001"
running_docker="kubevirt-plugin=http://host.docker.internal:9001"

get_plugin_url() {
    name="$1"
    echo "$plugins" | while IFS='=' read -r key val; do
        [ "$key" = "$name" ] && echo "$val" && return
    done
}

INITIAL_PORT=9002

for arg in "$@"; do
    plugin_url=$(get_plugin_url "$arg")

    if [ -z "$plugin_url" ]; then
        echo "Unknown plugin: $arg"
        exit 1
    fi

    if [ ! -d "../$arg" ]; then
        echo "Creating folder $arg ..."
        cd ..
        echo "Cloning $plugin_url ..."
        git clone "$plugin_url"
        cd "$arg"
    else
        cd "../$arg"
    fi

    git pull

    pid="$(lsof -t -i:$INITIAL_PORT 2>/dev/null || true)"
    [ -n "$pid" ] && kill -9 "$pid"

    if [ "$arg" = "monitoring-plugin" ]; then
        cd web
        npm ci
        PORT=$INITIAL_PORT npm run start -- --port=$INITIAL_PORT &
    else
        npm ci
        PORT=$INITIAL_PORT npm run start -- --port="$INITIAL_PORT" &
    fi

    running_podman_linux="$running_podman_linux,$arg=http://localhost:$INITIAL_PORT"
    running_podman="$running_podman,$arg=http://host.containers.internal:$INITIAL_PORT"
    running_docker="$running_docker,$arg=http://host.docker.internal:$INITIAL_PORT"

    INITIAL_PORT=$((INITIAL_PORT + 1))
done

CONSOLE_IMAGE=${CONSOLE_IMAGE:-"quay.io/openshift/origin-console:latest"}
CONSOLE_PORT=${CONSOLE_PORT:-9000}

echo "Starting local OpenShift console..."

# Set required env vars
BRIDGE_USER_AUTH="disabled"
BRIDGE_K8S_MODE="off-cluster"
BRIDGE_K8S_AUTH="bearer-token"
BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(oc whoami --show-server)
BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}' 2>/dev/null || echo "")
BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}' 2>/dev/null || echo "")
BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token 2>/dev/null)
BRIDGE_USER_SETTINGS_LOCATION="localstorage"
BRIDGE_I18N_NAMESPACES="plugin__kubevirt-plugin"

echo "API Server: $BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT"
echo "Console Image: $CONSOLE_IMAGE"
echo "Console URL: http://localhost:${CONSOLE_PORT}"

# Build --env args dynamically
env_args=""
for var in $(set | grep '^BRIDGE_' | cut -d= -f1); do
    eval val=\$$var
    env_args="$env_args --env $var='$val'"
done

# Prefer podman
if command -v podman >/dev/null; then
    if [ "$(uname -s)" = "Linux" ]; then
        env_args="$env_args --env BRIDGE_PLUGINS=$running_podman_linux"
        sh -c "podman run --pull=always --rm --network=host $env_args \"$CONSOLE_IMAGE\""
    else
        env_args="$env_args --env BRIDGE_PLUGINS=$running_podman"
        sh -c "podman run --platform=linux/x86_64 --pull=always --rm -p \"$CONSOLE_PORT\":9000 $env_args \"$CONSOLE_IMAGE\""
    fi
else
    env_args="$env_args --env BRIDGE_PLUGINS=$running_docker"
    if [ "$(uname)" = "Darwin" ]; then
        sh -c "docker run --platform=linux/x86_64 --pull=always --rm -p \"$CONSOLE_PORT\":9000 $env_args \"$CONSOLE_IMAGE\""
    else
        sh -c "docker run --pull=always --rm -p \"$CONSOLE_PORT\":9000 $env_args \"$CONSOLE_IMAGE\""
    fi
fi
