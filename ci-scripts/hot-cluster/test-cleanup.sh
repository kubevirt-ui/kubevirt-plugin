#!/bin/bash
#
# Deletes test-created VM/template/storage resources from the e2e run's test
# namespace (TEST_NS), plus a handful of fixed-name cluster-scoped resources
# the test suites also create (see below) -- everything else cluster-wide is
# left untouched.
#
export TEST_NS=${TEST_NS:-${CYPRESS_TEST_NS:-'auto-test-ns'}}
# Only test-created secrets go here -- NOT --all. The test namespace also
# holds ci-env-controller's own console/Helm-release secrets (e.g. the
# console's TLS/session secrets, pull-secret copies), which `delete secret
# --all` was wiping alongside the test-created one, tearing down the
# in-flight console mid-run. Confirmed live as a contributing factor in
# PR #4298 attempt 3's cascading failure (CNV-92722 finding 7).
export TEST_SECRET_NAME=${TEST_SECRET_NAME:-${CYPRESS_TEST_SECRET_NAME:-'auto-test-secret'}}

oc -n ${TEST_NS} delete vm --all --wait=false || true
oc -n ${TEST_NS} delete template --all --wait=false || true
oc -n ${TEST_NS} delete VirtualMachineSnapshot --all --ignore-not-found || true
oc -n ${TEST_NS} delete datavolume --all --wait=false || true
oc -n ${TEST_NS} delete datasource --all --wait=false || true
oc -n ${TEST_NS} delete pvc --all --wait=false || true
oc -n ${TEST_NS} delete secret "${TEST_SECRET_NAME}" --ignore-not-found --wait=false || true
oc -n ${TEST_NS} delete net-attach-def --all --ignore-not-found --wait=false || true
oc -n ${TEST_NS} delete VirtualMachineInstancetype example --ignore-not-found --wait=false || true
oc -n ${TEST_NS} delete VirtualMachinePreference example --ignore-not-found --wait=false || true

# Cluster-scoped counterparts of the above, created under the same fixed
# "example" name by the Cypress suite's YAML-creation tests. Unlike TEST_NS
# (destroyed fresh each run), these persist across runs on a long-lived
# cluster and collide with the next run's attempt to create them, e.g.
# `virtualmachineclusterinstancetypes.instancetype.kubevirt.io "example"
# already exists` -- confirmed live via CNV-92679's Cypress verification.
oc delete virtualmachineclusterinstancetype example --ignore-not-found --wait=false || true
oc delete virtualmachineclusterpreference example --ignore-not-found --wait=false || true
oc delete migrationpolicy example --ignore-not-found --wait=false || true
