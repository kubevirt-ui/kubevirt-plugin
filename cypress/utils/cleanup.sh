#!/bin/bash

oc delete vm --all --all-namespaces --wait=false
oc delete template --all -n auto-test-ns --wait=false
oc delete template -l app.kubernetes.io/name=custom-templates -n openshift --wait=false
oc delete VirtualMachineSnapshot --all -n auto-test-ns --ignore-not-found --wait=false
oc delete datavolume --all -n auto-test-ns --wait=false
oc delete datasource --all -n auto-test-ns --wait=false
oc delete datasource -n openshift-virtualization-os-images -l app.kubernetes.io/part-of!=hyperconverged-cluster --wait=false
oc delete datavolume -n openshift-virtualization-os-images -l app.kubernetes.io/part-of!=hyperconverged-cluster --wait=false
oc delete pvc --all -n default --wait=false
oc delete pvc --all -n auto-test-ns --wait=false
oc delete pvc -n openshift-cnv -l k8s-app!=hostpath-provisioner --wait=false
oc delete pvc --all -n openshift --wait=false
oc delete pvc --all -n openshift-virtualization-os-images --wait=false
oc delete secret -n auto-test-ns --all --ignore-not-found --wait=false
oc delete net-attach-def --all -n auto-test-ns --ignore-not-found --wait=false
oc delete VirtualMachineClusterInstancetype example --ignore-not-found --wait=false
oc delete VirtualMachineInstancetype example --ignore-not-found --wait=false
oc delete vmcp example --ignore-not-found --wait=false
oc delete vmp example --ignore-not-found --wait=false
oc delete service example --ignore-not-found --wait=false
oc delete route auto-test-route --ignore-not-found --wait=false
oc delete ingress example --ignore-not-found --wait=false
oc delete networkpolicy auto-test-net-policy --ignore-not-found --wait=false
oc delete multi-networkpolicy auto-test-multi-policy --ignore-not-found --wait=false
oc delete MigrationPolicy example --ignore-not-found --wait=false
oc delete nncp --all -n auto-test-ns --ignore-not-found --wait=false
oc delete project empty-project auto-test-ns --ignore-not-found --wait=false
oc delete migplan --all --all-namespaces --wait=false

