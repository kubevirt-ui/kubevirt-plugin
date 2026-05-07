#!/bin/bash

set -ex

# create test namespace
oc get namespace ${TEST_NS} || oc new-project ${TEST_NS}

# dismiss welcome modal and onboarding popovers
oc patch configmap -n ${CNV_NS} kubevirt-user-settings --type=merge --patch '{"data": {"kube-admin": "{\"quickStart\":{\"dontShowWelcomeModal\":true},\"onboardingPopoversHidden\":{\"vmsTab\":true,\"catalog\":true,\"createProject\":true}}"}}'
oc patch configmap -n ${CNV_NS} kubevirt-ui-features --type=merge --patch '{"data": {"advancedSearch": "true", "treeViewFolders": "true"}}'

# create secret
oc get secret -n ${TEST_NS} ${TEST_SECRET_NAME} || oc create -f playwright/fixtures/secret.yaml
