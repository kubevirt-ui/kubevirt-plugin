#!/usr/bin/env bash

set -eExuo pipefail

if [ $# -eq 0 ]
  then
    echo "kubevirt-plugin image not provided"
    echo "exiting..."
    exit 1
fi

function generateLogsAndCopyArtifacts {
  oc cluster-info dump > ${ARTIFACT_DIR}/cluster_info.json
  oc get secrets -A -o wide > ${ARTIFACT_DIR}/secrets.yaml
  oc get secrets -A -o yaml >> ${ARTIFACT_DIR}/secrets.yaml
  oc get catalogsource -A -o wide > ${ARTIFACT_DIR}/catalogsource.yaml
  oc get catalogsource -A -o yaml >> ${ARTIFACT_DIR}/catalogsource.yaml
  oc get subscriptions -n openshift-cnv -o wide > ${ARTIFACT_DIR}/subscription_details.yaml
  oc get subscriptions -n openshift-cnv -o yaml >> ${ARTIFACT_DIR}/subscription_details.yaml
  oc get csvs -n openshift-cnv -o wide > ${ARTIFACT_DIR}/csvs.yaml
  oc get csvs -n openshift-cnv -o yaml >> ${ARTIFACT_DIR}/csvs.yaml
  oc get deployments -n openshift-cnv -o wide > ${ARTIFACT_DIR}/deployment_details.yaml
  oc get deployments -n openshift-cnv -o yaml >> ${ARTIFACT_DIR}/deployment_details.yaml
  oc get installplan -n openshift-cnv -o wide > ${ARTIFACT_DIR}/installplan.yaml
  oc get installplan -n openshift-cnv -o yaml >> ${ARTIFACT_DIR}/installplan.yaml
  oc get nodes -o wide > ${ARTIFACT_DIR}/node.yaml
  oc get nodes -o yaml >> ${ARTIFACT_DIR}/node.yaml
  oc get pods -n openshift-cnv -o wide >> ${ARTIFACT_DIR}/pod_details_openshift-cnv.yaml
  oc get pods -n openshift-cnv -o yaml >> ${ARTIFACT_DIR}/pod_details_openshift-cnv.yaml
  oc logs deploy/odf-operator-controller-manager manager -n openshift-cnv > ${ARTIFACT_DIR}/odf.logs
  for pod in `oc get pods -n ${NS} --no-headers -o custom-columns=":metadata.name" | grep "kubevirt-plugin"`; do
        echo $pod 
        oc logs $pod -n ${NS} > ${ARTIFACT_DIR}/${pod}.logs
  done
  oc get serviceaccounts -n openshift-cnv -o wide > ${ARTIFACT_DIR}/serviceaccount.yaml
  oc get serviceaccounts -n openshift-cnv -o yaml >> ${ARTIFACT_DIR}/serviceaccount.yaml
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

PULL_SECRET_PATH="/var/run/operator-secret/dockerconfig" 
NAMESPACE="openshift-marketplace"
SECRET_NAME="ocs-secret"
NS="openshift-cnv"
ARTIFACT_DIR=${ARTIFACT_DIR:=/tmp/artifacts}
SCREENSHOTS_DIR=gui-test-screenshots



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
oc patch operatorhub.config.openshift.io/cluster -p='{"spec":{"sources":[{"disabled":true,"name":"redhat-operators"}]}}' --type=merge

echo "Creating secret for CI builds in ${NAMESPACE}"

createSecret ${NAMESPACE}

oc apply -f openshift-ci/odf-catalog-source.yaml ;

echo "Waiting for CatalogSource to be Ready"
# Have to sleep here for atleast 1 min to ensure catalog source is in stable READY state
sleep 60 

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

# Enable console plugin for kubevirt-plugin
export CONSOLE_CONFIG_NAME="cluster"
export KUBEVIRT_PLUGIN_NAME="kubevirt-plugin"

echo "Enabling Console Plugin for ODF Operator"
oc patch console.v1.operator.openshift.io ${CONSOLE_CONFIG_NAME} --type=json -p="[{'op': 'add', 'path': '/spec/plugins', 'value':["${KUBEVIRT_PLUGIN_NAME}"]}]"

ODF_CONSOLE_IMAGE="$1"
export ODF_CSV_NAME="$(oc get csv -n openshift-cnv -o=jsonpath='{.items[?(@.spec.displayName=="OpenShift Data Foundation")].metadata.name}')"

oc patch csv ${ODF_CSV_NAME} -n openshift-cnv --type='json' -p \
  "[{'op': 'replace', 'path': '/spec/install/spec/deployments/1/spec/template/spec/containers/0/image', 'value': \"${ODF_CONSOLE_IMAGE}\"}]"

# Installation occurs.
# This is also the default case if the CSV is in "Installing" state initially.
timeout 15m bash <<-'EOF'
echo "waiting for ${ODF_CSV_NAME} clusterserviceversion to succeed"
until [ "$(oc -n openshift-cnv get csv -o=jsonpath="{.items[?(@.metadata.name==\"${ODF_CSV_NAME}\")].status.phase}")" == "Succeeded" ]; do
  sleep 1
done
EOF

INSTALLER_DIR=${INSTALLER_DIR:=${ARTIFACT_DIR}/installer}

BRIDGE_KUBEADMIN_PASSWORD="$(cat "${KUBEADMIN_PASSWORD_FILE:-${INSTALLER_DIR}/auth/kubeadmin-password}")"
export BRIDGE_KUBEADMIN_PASSWORD
BRIDGE_BASE_ADDRESS="$(oc get consoles.config.openshift.io cluster -o jsonpath='{.status.consoleURL}')"
export BRIDGE_BASE_ADDRESS

# Disable color codes in Cypress since they do not render well CI test logs.
# https://docs.cypress.io/guides/guides/continuous-integration.html#Colors
export NO_COLOR=1

# Install dependencies.
yarn install

# Run tests.
yarn run test-cypress-headless

# Generate Cypress report.
yarn run cypress-postreport