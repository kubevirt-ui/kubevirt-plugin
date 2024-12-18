#!/usr/bin/env bash

set -eExuo pipefail

if [ $# -eq 0 ]
  then
    echo "kubevirt plugin image not provided"
    echo "exiting..."
    exit 1
fi

function generateLogsAndCopyArtifacts {
  oc cluster-info dump > ${ARTIFACT_DIR}/cluster_info.json
  oc get catalogsource -A -o wide > ${ARTIFACT_DIR}/catalogsource.yaml
  oc get catalogsource -A -o yaml >> ${ARTIFACT_DIR}/catalogsource.yaml
  oc get CustomResourceDefinition -o yaml > ${ARTIFACT_DIR}/CustomResourceDefinition.yaml
  oc get subscriptions -n ${NS} -o wide > ${ARTIFACT_DIR}/subscription_details.yaml
  oc get subscriptions -n ${NS} -o yaml >> ${ARTIFACT_DIR}/subscription_details.yaml
  oc get csvs -n ${NS} -o wide > ${ARTIFACT_DIR}/csvs.yaml
  oc get csvs -n ${NS} -o yaml >> ${ARTIFACT_DIR}/csvs.yaml
  oc get deployments -n ${NS} -o wide > ${ARTIFACT_DIR}/deployment_details.yaml
  oc get deployments -n ${NS} -o yaml >> ${ARTIFACT_DIR}/deployment_details.yaml
  oc get installplan -n ${NS} -o wide > ${ARTIFACT_DIR}/installplan.yaml
  oc get installplan -n ${NS} -o yaml >> ${ARTIFACT_DIR}/installplan.yaml
  oc get nodes -o wide > ${ARTIFACT_DIR}/node.yaml
  oc get nodes -o yaml >> ${ARTIFACT_DIR}/node.yaml
  oc get pods -n ${NS} -o wide >> ${ARTIFACT_DIR}/pod_details_openshift-kubevirt.yaml
  oc get pods -n ${NS} -o yaml >> ${ARTIFACT_DIR}/pod_details_openshift-kubevirt.yaml
  for pod in `oc get pods -n ${NS} --no-headers -o custom-columns=":metadata.name" | grep "kubevirt"`; do
        echo $pod 
        oc logs $pod -n ${NS} > ${ARTIFACT_DIR}/${pod}.logs
  done
  oc get serviceaccounts -n ${NS} -o wide > ${ARTIFACT_DIR}/serviceaccount.yaml
  oc get serviceaccounts -n ${NS} -o yaml >> ${ARTIFACT_DIR}/serviceaccount.yaml
  oc get console.v1.operator.openshift.io cluster -o yaml >> ${ARTIFACT_DIR}/cluster.yaml
  
  if [ -d "$ARTIFACT_DIR" ] && [ -d "$SCREENSHOTS_DIR" ]; then
    if [[ -z "$(ls -A -- "$SCREENSHOTS_DIR")" ]]; then
      echo "No artifacts were copied."
    else
      echo "Copying artifacts from $(pwd)..."
      cp -r "$SCREENSHOTS_DIR" "${ARTIFACT_DIR}/gui-test-screenshots"
    fi
  fi
}



trap generateLogsAndCopyArtifacts EXIT
trap generateLogsAndCopyArtifacts ERR

# Unset KUBERNETES_* vars which might conflict with OpenShift-CI
unset KUBERNETES_SERVICE_PORT_HTTPS
unset KUBERNETES_SERVICE_PORT
unset KUBERNETES_PORT_443_TCP
unset KUBERNETES_PORT_443_TCP_PROTO
unset KUBERNETES_PORT_443_TCP_ADDR
unset KUBERNETES_SERVICE_HOST
unset KUBERNETES_PORT
unset KUBERNETES_PORT_443_TCP_PORT

PULL_SECRET_PATH="/var/run/operator-secret/dockerconfig" 
NAMESPACE="openshift-marketplace"
SECRET_NAME="ocs-secret"
NS="kubevirt-hyperconverged"
ARTIFACT_DIR=${ARTIFACT_DIR:=/tmp/artifacts}
SCREENSHOTS_DIR="cypress/gui-test-screenshots"

function createSecret {
    oc create secret generic ${SECRET_NAME} --from-file=.dockerconfigjson=${PULL_SECRET_PATH} --type=kubernetes.io/dockerconfigjson -n $1
}

function linkSecrets {
  for serviceAccount in `oc get serviceaccounts -n ${NS} --no-headers -o custom-columns=":metadata.name" | sed 's/"//g'`; do
        echo "Linking ${SECRET_NAME} to ${serviceAccount}"
        oc secrets link ${serviceAccount} ${SECRET_NAME} -n ${NS} --for=pull
  done
}

function deleteAllPods {
  oc delete pods --all -n $1 
}

echo "Creating secret for CI builds in ${NAMESPACE}"

createSecret ${NAMESPACE}

echo "Creating secret for linking pods"
createSecret ${NS}

echo "Adding secret to all service accounts in ${NS} namespace"
linkSecrets

echo "Restarting pods for secret update"
deleteAllPods ${NS}

sleep 30

echo "Adding secret to all service accounts in ${NS} namespace"
linkSecrets

echo "Restarting pods for secret update"
deleteAllPods ${NS}

sleep 120

echo "Adding secret to all service accounts in ${NS} namespace"
linkSecrets

echo "Restarting pods for secret update"
deleteAllPods ${NS}

sleep 120

# Enable console plugin for Kubevirt
export CONSOLE_CONFIG_NAME="cluster"
export KUBEVIRT_PLUGIN_NAME="kubevirt-plugin"
KUBEVIRT_PLUGIN_IMAGE="$1"

echo "Modify the kubevirt console plugin image"
CSV=$(oc get csv -o name -n ${NS})
oc get $CSV -n ${NS} -o json > /tmp/hco_csv.json
EXISTING_PLUGIN_IMAGE=$(jq -r '.spec.install.spec.deployments[] | select(.name=="hco-operator").spec.template.spec.containers[0].env[] | select(.name=="KV_CONSOLE_PLUGIN_IMAGE").value' /tmp/hco_csv.json)
sed -i -r "s|$EXISTING_PLUGIN_IMAGE|$KUBEVIRT_PLUGIN_IMAGE|" /tmp/hco_csv.json
oc apply -f /tmp/hco_csv.json

until \
  oc wait pods -n ${NS} --for=jsonpath='{.spec.containers[0].image}'="$KUBEVIRT_PLUGIN_IMAGE" -l app=kubevirt-hyperconverged -l app.kubernetes.io/component=kubevirt-console-plugin

  do
    sleep 1
  done

INSTALLER_DIR=${INSTALLER_DIR:=${ARTIFACT_DIR}/installer}

BRIDGE_KUBEADMIN_PASSWORD="$(cat "${KUBEADMIN_PASSWORD_FILE:-${INSTALLER_DIR}/auth/kubeadmin-password}")"
export BRIDGE_KUBEADMIN_PASSWORD
BRIDGE_BASE_ADDRESS="$(oc get consoles.config.openshift.io cluster -o jsonpath='{.status.consoleURL}')"
export BRIDGE_BASE_ADDRESS

# Disable color codes in Cypress since they do not render well CI test logs.
# https://docs.cypress.io/guides/guides/continuous-integration.html#Colors
export NO_COLOR=1

# Install dependencies.
yarn install --ignore-engines

# Add mochawesome-report-generator
yarn add global mochawesome-report-generator --ignore-engines

# Run tests.
yarn run test-cypress-headless

# Generate Cypress report.
yarn run cypress-postreport
