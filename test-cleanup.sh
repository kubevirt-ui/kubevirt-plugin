#!/bin/bash

oc delete vm --all -n auto-test-ns --wait=false
oc delete template --all -n auto-test-ns --wait=false
oc delete template -l app.kubernetes.io/name=custom-templates -n openshift --wait=false
oc delete VirtualMachineSnapshot --all -n auto-test-ns --ignore-not-found
oc delete datavolume --all -n auto-test-ns --wait=false
oc delete datasource --all -n auto-test-ns --wait=false
oc delete datasource  -n openshift-virtualization-os-images -l app.kubernetes.io/part-of!=hyperconverged-cluster
oc delete datavolume  -n openshift-virtualization-os-images -l app.kubernetes.io/part-of!=hyperconverged-cluster
oc delete pvc --all -n auto-test-ns --wait=false
oc delete pvc -n openshift-cnv -l k8s-app!=hostpath-provisioner --wait=false
oc delete pvc --all -n openshift --wait=false
oc delete pvc --all -n openshift-virtualization-os-images --wait=false
oc delete secret --all -n auto-test-ns --ignore-not-found --wait=false
oc delete net-attach-def --all --ignore-not-found -n auto-test-ns --wait=false
oc delete VirtualMachineClusterInstancetype example --ignore-not-found --wait=false
oc delete VirtualMachineInstancetype example -n auto-test-ns --ignore-not-found --wait=false
oc delete VirtualMachineClusterPreference example --ignore-not-found --wait=false
oc delete VirtualMachinePreference example -n auto-test-ns --ignore-not-found --wait=false
oc delete MigrationPolicy example --ignore-not-found --wait=false
