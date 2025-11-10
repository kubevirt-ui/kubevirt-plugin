#!/usr/bin/env bash

ROUTE_NAME="kubevirt-apiserver-proxy"
NAMESPACE="openshift-cnv"

APPS_DOMAIN=$(oc get ingress.config.openshift.io/cluster -o jsonpath='{.spec.domain}')
HOSTNAME="kubevirt-apiserver-proxy.${APPS_DOMAIN}"

# Check if route exists
if oc get route "$ROUTE_NAME" -n "$NAMESPACE" &>/dev/null; then
    echo "Route '$ROUTE_NAME' already exists in namespace '$NAMESPACE'."
else
    echo "Route '$ROUTE_NAME' not found. Creating..."

    cat <<EOF | oc create -f -
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: ${ROUTE_NAME}
  namespace: ${NAMESPACE}
  annotations:
    haproxy.router.openshift.io/hsts_header: max-age=31536000;includeSubDomains;preload
spec:
  host: ${HOSTNAME}
  to:
    kind: Service
    name: ${ROUTE_NAME}-service
    weight: 100
  port:
    targetPort: 8080
  tls:
    termination: reencrypt
  wildcardPolicy: None
EOF

    echo "Route '$ROUTE_NAME' created successfully with host: ${HOSTNAME}"
fi

# Determine endpoint based on PROXY_ENV environment variable
if [ "${PROXY_ENV:-production}" = "local" ]; then
    echo "Using local proxy..."

    # Determine endpoint based on container runtime and OS
    if command -v podman >/dev/null; then
        if [ "$(uname -s)" = "Linux" ]; then
            ENDPOINT="http://localhost:8080"
        else
            ENDPOINT="http://host.containers.internal:8080"
        fi
    else
        ENDPOINT="http://host.docker.internal:8080"
    fi
else
    echo "Using cluster route proxy..."
    ENDPOINT="https://${HOSTNAME}"
fi

export BRIDGE_PLUGIN_PROXY=$(
    cat <<END | jq -c .
{"services":[
    {
        "consoleAPIPath":"/api/proxy/plugin/kubevirt-plugin/kubevirt-apiserver-proxy/",
        "endpoint":"${ENDPOINT}",
        "authorize":true
    }
]}
END
)

echo "PROXY: $(echo "${BRIDGE_PLUGIN_PROXY}" | jq .)"
