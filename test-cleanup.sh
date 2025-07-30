#!/bin/bash

export TEST_NS='auto-test-ns'

oc delete vm --all -n ${TEST_NS} --wait=false
oc delete template --all -n ${TEST_NS} --wait=false
oc delete template -l app.kubernetes.io/name=custom-templates -n openshift --wait=false
oc delete VirtualMachineSnapshot --all -n ${TEST_NS} --ignore-not-found
oc delete datavolume --all -n ${TEST_NS} --wait=false
oc delete datasource --all -n ${TEST_NS} --wait=false
oc delete datasource  -n openshift-virtualization-os-images -l app.kubernetes.io/part-of!=hyperconverged-cluster
oc delete datavolume  -n openshift-virtualization-os-images -l app.kubernetes.io/part-of!=hyperconverged-cluster
oc delete pvc --all -n ${TEST_NS} --wait=false
oc delete pvc -n openshift-cnv -l k8s-app!=hostpath-provisioner --wait=false
oc delete pvc --all -n openshift --wait=false
oc delete pvc --all -n openshift-virtualization-os-images --wait=false
oc delete secret --all -n ${TEST_NS} --ignore-not-found --wait=false
oc delete net-attach-def --all -n ${TEST_NS} --ignore-not-found --wait=false
oc delete VirtualMachineClusterInstancetype example --ignore-not-found --wait=false
oc delete VirtualMachineInstancetype example -n ${TEST_NS} --ignore-not-found --wait=false
oc delete VirtualMachineClusterPreference example --ignore-not-found --wait=false
oc delete VirtualMachinePreference example -n ${TEST_NS} --ignore-not-found --wait=false
oc delete MigrationPolicy example --ignore-not-found --wait=false
oc delete migplan --all -n ${TEST_NS} --ignore-not-found --wait=false
oc delete ns auto-test-ns
