#!/usr/bin/env bash
#Please run this script under bash 4+
set -euo pipefail

#Cloning, pulling and running other plugins starting from port 9002
# to add more plugin simply add more properites to dic. [name-of-plugin]={git-repo-url}
declare -A plugins=(["monitoring-plugin"]="https://github.com/openshift/monitoring-plugin.git", ["networking-console-plugin"]="https://github.com/openshift/networking-console-plugin.git")
declare -A runningPlugins=(["podman-linux"]="kubevirt-plugin=http://localhost:9001", ["podman"]="kubevirt-plugin=http://host.containers.internal:9001", ["docker"]="kubevirt-plugin=http://host.docker.internal:9001")

INITIAL_PORT=9002
for arg in $@; do

    if [ ! -d "../$arg" ]; then
        echo "Creating a folder $arg ..."
        cd ../
        echo "Cloning "${plugins[$arg]}" ..."
        git clone ${plugins[$arg]}
        cd $arg
    else
        cd ../$arg
    fi
    git pull

    if [ $arg = "monitoring-plugin" ]; then
        cd web
    fi

    yarn

    if [ "$(lsof -t -i:$INITIAL_PORT)" != "" ]; then
        kill -9 $(lsof -t -i:$INITIAL_PORT)
    fi

    PORT=$INITIAL_PORT yarn start --port=$INITIAL_PORT &

    runningPlugins["podman-linux"]+=",${arg}=http://localhost:${INITIAL_PORT}"
    runningPlugins["podman"]+=",${arg}=http://host.containers.internal:${INITIAL_PORT}"
    runningPlugins["docker"]+=",${arg}=http://host.docker.internal:${INITIAL_PORT}"
    INITIAL_PORT=$(($INITIAL_PORT + 1))
done

CONSOLE_IMAGE=${CONSOLE_IMAGE:="quay.io/openshift/origin-console:latest"}
CONSOLE_PORT=${CONSOLE_PORT:=9000}

echo "Starting local OpenShift console..."

BRIDGE_USER_AUTH="disabled"
BRIDGE_K8S_MODE="off-cluster"
BRIDGE_K8S_AUTH="bearer-token"
BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(oc whoami --show-server)
BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}')
BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}')
BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token 2>/dev/null)
BRIDGE_USER_SETTINGS_LOCATION="localstorage"
BRIDGE_I18N_NAMESPACES="plugin__kubevirt-plugin"

echo "API Server: $BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT"
echo "Console Image: $CONSOLE_IMAGE"
echo "Console URL: http://localhost:${CONSOLE_PORT}"

#Prefer podman if installed. Otherwise, fall back to docker.
if [ -x "$(command -v podman)" ]; then
    if [ "$(uname -s)" = "Linux" ]; then
        # Use host networking on Linux since host.containers.internal is unreachable in some environments.
        BRIDGE_PLUGINS="${runningPlugins["podman-linux"]}"
        podman run --pull=always --rm --network=host --env-file <(set | grep BRIDGE) $CONSOLE_IMAGE
    else
        BRIDGE_PLUGINS="${runningPlugins["podman"]}"
        podman run --platform=linux/x86_64 --pull=always --rm -p "$CONSOLE_PORT":9000 --env-file <(set | grep BRIDGE) $CONSOLE_IMAGE
    fi
else
    BRIDGE_PLUGINS="${runningPlugins["docker"]}"
    if [ "$(uname)" == "Darwin" ]; then
        docker run --platform=linux/x86_64 --pull=always --rm -p "$CONSOLE_PORT":9000 --env-file <(set | grep BRIDGE) $CONSOLE_IMAGE
    else
        docker run --pull=always --rm -p "$CONSOLE_PORT":9000 --env-file <(set | grep BRIDGE) $CONSOLE_IMAGE
    fi
fi
