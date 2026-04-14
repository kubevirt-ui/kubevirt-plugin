#!/bin/bash
#
# A copy of `../test-cleanup.sh` to use the correct namespace from the e2e run, and only delete resources in that namespace.
#
export TEST_NS=${CYPRESS_TEST_NS:-'auto-test-ns'}

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

#oc -n openshift-virtualization-os-images delete datasource  -l app.kubernetes.io/part-of!=hyperconverged-cluster
#oc -n openshift-virtualization-os-images delete datavolume  -l app.kubernetes.io/part-of!=hyperconverged-cluster
#oc -n openshift-virtualization-os-images delete pvc --all --wait=false
#oc -n openshift-cnv delete pvc -l k8s-app!=hostpath-provisioner --wait=false
#oc -n openshift delete template -l app.kubernetes.io/name=custom-templates --wait=false
#oc -n openshift delete pvc --all --wait=false
#oc -n openshift delete VirtualMachineClusterInstancetype example --ignore-not-found --wait=false
#oc -n openshift delete VirtualMachineClusterPreference example --ignore-not-found --wait=false
#oc -n openshift delete MigrationPolicy example --ignore-not-found --wait=false
