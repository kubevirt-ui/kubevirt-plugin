#!/bin/bash
cleanup () {
  oc delete vm --all --all-namespaces --wait=false
  oc delete template --all -n default --wait=false
  oc delete template -l app.kubernetes.io/name=custom-templates -n openshift --wait=false
  oc delete datavolume --all -n default --wait=false
  oc delete datasource --all -n default --wait=false
  oc delete datasource  -n openshift-virtualization-os-images -l app.kubernetes.io/part-of!=hyperconverged-cluster
  oc delete datavolume  -n openshift-virtualization-os-images -l app.kubernetes.io/part-of!=hyperconverged-cluster
  oc delete pvc --all -n default --wait=false
  oc delete pvc -n openshift-cnv -l k8s-app!=hostpath-provisioner --wait=false
  oc delete pvc --all -n openshift --wait=false
  oc delete pvc --all -n openshift-virtualization-os-images --wait=false
  oc delete secret -n default --all --ignore-not-found --wait=false
  oc delete net-attach-def --all -n default --wait=false
  oc delete vmcp example --ignore-not-found --wait=false
  oc delete MigrationPolicy example --ignore-not-found --wait=false
}
