#!/bin/bash

set -ex

# Validate required environment variables
: "${TEST_NS:?TEST_NS is required}"
: "${CNV_NS:?CNV_NS is required}"
: "${TEST_SECRET_NAME:?TEST_SECRET_NAME is required}"

# create test namespace
oc get namespace "${TEST_NS}" || oc new-project "${TEST_NS}"

# dismiss welcome modal and onboarding popovers
# KubeVirt plugin user settings are SDK user preferences (kubevirt.<setting> keys) stored in the
# per-user console ConfigMap (kubeadmin); the console creates it on first login, so create it if missing.
CONSOLE_USER_SETTINGS_NS="openshift-console-user-settings"
CONSOLE_USER_SETTINGS_CM="user-settings-${CONSOLE_USER_SETTINGS_USER:-kubeadmin}"
KUBEVIRT_QUICK_START='{"dontShowWelcomeModal":true}'
KUBEVIRT_POPOVERS_HIDDEN='{"vmsTab":true,"catalog":true,"createProject":true,"navCollapse":true}'
oc patch configmap -n "${CONSOLE_USER_SETTINGS_NS}" "${CONSOLE_USER_SETTINGS_CM}" --type=merge \
  --patch "$(jq -n --arg qs "${KUBEVIRT_QUICK_START}" --arg ph "${KUBEVIRT_POPOVERS_HIDDEN}" \
    '{data: {"kubevirt.quickStart": $qs, "kubevirt.onboardingPopoversHidden": $ph}}')" ||
  oc create configmap -n "${CONSOLE_USER_SETTINGS_NS}" "${CONSOLE_USER_SETTINGS_CM}" \
    --from-literal="kubevirt.quickStart=${KUBEVIRT_QUICK_START}" \
    --from-literal="kubevirt.onboardingPopoversHidden=${KUBEVIRT_POPOVERS_HIDDEN}"
oc patch configmap -n "${CNV_NS}" kubevirt-ui-features --type=merge --patch '{"data": {"advancedSearch": "true", "treeViewFolders": "true"}}'

# create secret
oc get secret -n "${TEST_NS}" "${TEST_SECRET_NAME}" || oc create -f "playwright/fixtures/secret.yaml"
