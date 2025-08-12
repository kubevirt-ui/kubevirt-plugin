#!/bin/bash

set -ex

export TEST_SECRET_NAME='auto-test-secret'

# create test namespace
oc get ns ${CYPRESS_TEST_NS} || oc new-project ${CYPRESS_TEST_NS}

# close welcome modal
oc patch configmap -n ${CYPRESS_CNV_NS} kubevirt-user-settings --type=merge --patch '{"data": {"kube-admin": "{\"quickStart\":{\"dontShowWelcomeModal\":true}}"}}'
oc patch configmap -n ${CYPRESS_CNV_NS} kubevirt-ui-features --type=merge --patch '{"data": {"advancedSearch": "true", "treeViewFolders": "true"}}'

# create secret
oc get secret -n ${CYPRESS_TEST_NS} ${TEST_SECRET_NAME} || oc create -f cypress/fixtures/secret.yaml

# export NONPRIV credentials, adjust it if necessary
if $CYPRESS_NON_PRIV; then
  export CYPRESS_NON_PRIV_IDP='test'
  export CYPRESS_NON_PRIV_USER='test'
  export CYPRESS_NON_PRIV_PASSWD='test'
fi
