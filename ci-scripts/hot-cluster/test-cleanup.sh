#!/bin/bash
#
# Deletes test-created VM/template/storage resources from the e2e run's test
# namespace only (TEST_NS), leaving cluster-wide resources untouched.
#
export TEST_NS=${TEST_NS:-${CYPRESS_TEST_NS:-'auto-test-ns'}}

oc -n ${TEST_NS} delete vm --all --wait=false || true
oc -n ${TEST_NS} delete template --all --wait=false || true
oc -n ${TEST_NS} delete VirtualMachineSnapshot --all --ignore-not-found || true
oc -n ${TEST_NS} delete datavolume --all --wait=false || true
oc -n ${TEST_NS} delete datasource --all --wait=false || true
oc -n ${TEST_NS} delete pvc --all --wait=false || true
oc -n ${TEST_NS} delete secret --all --ignore-not-found --wait=false || true
oc -n ${TEST_NS} delete net-attach-def --all --ignore-not-found --wait=false || true
oc -n ${TEST_NS} delete VirtualMachineInstancetype example --ignore-not-found --wait=false || true
oc -n ${TEST_NS} delete VirtualMachinePreference example --ignore-not-found --wait=false || true
