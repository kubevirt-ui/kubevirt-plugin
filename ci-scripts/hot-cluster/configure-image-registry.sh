#!/usr/bin/env bash
set -euo pipefail

echo "Ensuring internal image registry is available for in-cluster builds..."
REGISTRY_MGMT=$(oc get configs.imageregistry.operator.openshift.io cluster -o jsonpath='{.spec.managementState}' 2>/dev/null || echo "unknown")
if [[ "${REGISTRY_MGMT}" == "Removed" ]]; then
  echo "Image registry is Removed — setting to Managed with emptyDir storage..."
  oc patch configs.imageregistry.operator.openshift.io cluster \
    --type merge -p '{"spec":{"managementState":"Managed","storage":{"emptyDir":{}}}}'
elif [[ "${REGISTRY_MGMT}" == "Managed" ]]; then
  STORAGE=$(oc get configs.imageregistry.operator.openshift.io cluster -o jsonpath='{.spec.storage}' 2>/dev/null)
  if [[ -z "${STORAGE}" || "${STORAGE}" == "{}" ]]; then
    echo "Image registry has no storage — configuring emptyDir..."
    oc patch configs.imageregistry.operator.openshift.io cluster \
      --type merge -p '{"spec":{"storage":{"emptyDir":{}}}}'
  else
    echo "Image registry is Managed with storage configured."
  fi
else
  echo "Image registry managementState: ${REGISTRY_MGMT}"
fi
echo "Waiting for image-registry operator to be available..."
for i in $(seq 1 30); do
  if oc get co image-registry -o jsonpath='{.status.conditions[?(@.type=="Available")].status}' 2>/dev/null | grep -q "True"; then
    echo "Image registry is Available."
    break
  fi
  echo "Waiting for image-registry... (${i}/30)"
  sleep 20
done
oc get co image-registry 2>&1
echo "Verifying registry pods are running..."
oc get pods -n openshift-image-registry --no-headers 2>&1 | head -5 || true
