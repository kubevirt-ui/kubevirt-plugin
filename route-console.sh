#!/usr/bin/env bash

ROUTE_NAME="kubevirt-apiserver-proxy"
NAMESPACE="openshift-cnv"

APPS_DOMAIN=$(oc get ingress.config.openshift.io/cluster -o jsonpath='{.spec.domain}' 2>/dev/null || echo "")
HOSTNAME="kubevirt-apiserver-proxy.${APPS_DOMAIN}"

# Check if route exists
if oc get route "$ROUTE_NAME" -n "$NAMESPACE" &>/dev/null; then
    echo "Route '$ROUTE_NAME' already exists in namespace '$NAMESPACE'."
else
    echo "Route '$ROUTE_NAME' not found. Creating..."

    cat <<EOF | oc create -f - 2>/dev/null || true
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

  if oc get route "$ROUTE_NAME" -n "$NAMESPACE" &>/dev/null; then
    echo "Route '$ROUTE_NAME' created successfully with host: ${HOSTNAME}"
  else
      echo "Not able to create the route"
  fi

fi

export BRIDGE_PLUGIN_PROXY=$(
    cat <<END | jq -c .
{"services":[
    {
        "consoleAPIPath":"/api/proxy/plugin/kubevirt-plugin/kubevirt-apiserver-proxy/",
        "endpoint":"https://${HOSTNAME}",
        "authorize":true
    }
]}
END
)

echo "PROXY: $(echo "${BRIDGE_PLUGIN_PROXY}" | jq .)"
