#!/bin/bash

set -ex

# Validate required environment variables
: "${TEST_NS:?TEST_NS is required}"
: "${CNV_NS:?CNV_NS is required}"
: "${TEST_SECRET_NAME:?TEST_SECRET_NAME is required}"

# create test namespace
oc get namespace "${TEST_NS}" || oc new-project "${TEST_NS}"

# dismiss welcome modal and onboarding popovers
oc patch configmap -n "${CNV_NS}" kubevirt-user-settings --type=merge --patch '{"data": {"kube-admin": "{\"quickStart\":{\"dontShowWelcomeModal\":true},\"onboardingPopoversHidden\":{\"vmsTab\":true,\"catalog\":true,\"createProject\":true,\"navCollapse\":true}}"}}'
oc patch configmap -n "${CNV_NS}" kubevirt-ui-features --type=merge --patch '{"data": {"advancedSearch": "true", "treeViewFolders": "true"}}'

# create secret
oc get secret -n "${TEST_NS}" "${TEST_SECRET_NAME}" || oc create -f "playwright/fixtures/secret.yaml"
