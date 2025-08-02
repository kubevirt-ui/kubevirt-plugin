#!/bin/bash

set -ex

export DOWNSTREAM=true
export TEST_NS='auto-test-ns'
export TEST_SECRET_NAME='auto-test-secret'

# create test namespace
oc delete project auto-test-ns --ignore-not-found
sleep 10
oc new-project ${TEST_NS}

# close welcome modal
oc patch configmap -n ${CYPRESS_CNV_NS} kubevirt-user-settings --type=merge --patch '{"data": {"kube-admin": "{\"quickStart\":{\"dontShowWelcomeModal\":true}}"}}'
oc patch configmap -n ${CYPRESS_CNV_NS} kubevirt-ui-features --type=merge --patch '{"data": {"advancedSearch": "true", "treeViewFolders": "true"}}'

# create secret
oc create -f cypress/fixtures/secret.yaml
