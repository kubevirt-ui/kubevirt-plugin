#!/bin/bash

set -ex

# create test namespace
oc get namespace ${CYPRESS_TEST_NS} || oc new-project ${CYPRESS_TEST_NS}

# close welcome modal
oc patch configmap -n ${CYPRESS_CNV_NS} kubevirt-user-settings --type=merge --patch '{"data": {"kube-admin": "{\"quickStart\":{\"dontShowWelcomeModal\":true}}"}}'
oc patch configmap -n ${CYPRESS_CNV_NS} kubevirt-ui-features --type=merge --patch '{"data": {"advancedSearch": "true", "treeViewFolders": "true"}}'

# create secret
oc get secret -n ${CYPRESS_TEST_NS} ${CYPRESS_TEST_SECRET_NAME} || oc create -f cypress/fixtures/secret.yaml
