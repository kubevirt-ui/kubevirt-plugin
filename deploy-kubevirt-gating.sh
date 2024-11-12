#!/bin/bash

export ON_CI="ON_CI"

# Wait until master and worker MCP are updated
# or timeout after 90min.
wait_mcp_for_updated()
{
    local mcp_updated="false"

    sleep 30

    for i in {1..60}
    do
      echo "Attempt ${i}/60"
      sleep 30
      if oc wait mcp master worker --for condition=updated --timeout=1m; then
        echo "MCP is updated"
        mcp_updated="true"
        break
      fi
    done

    if [[ "$mcp_updated" == "false" ]]; then
      echo "Error: MCP didn't get updated!!"
      exit 1
    fi
}

download_vritctl()
{
  VIRTCTL_DOWNLOAD_URL="https://github.com/kubevirt/kubevirt/releases/download/${VIRTCTL_VERSION}/virtctl-${VIRTCTL_VERSION}"
  VIRTCTL_X86_64="${VIRTCTL_DOWNLOAD_URL}-linux-x86_64"
  VIRTCTL_AMD64="${VIRTCTL_DOWNLOAD_URL}-linux-amd64"

  # Install virtctl binary and add to PATH
  mkdir virtctl

  # --quiet as wget logs an URL that should not be logged since it provides access to download a file (it is a presigned URL)
  wget ${VIRTCTL_AMD64} -O virtctl/virtctl --quiet || wget ${VIRTCTL_X86_64} -O virtctl/virtctl --quiet
  [[ ! -f "virtctl/virtctl" ]] && echo "ERROR: virtctl binary is unavailable for download" && exit 1

  chmod +x virtctl/virtctl

  export PATH="${PATH}:$(pwd)/virtctl"
}
# ----------------------------------------------------------------------------------------------------
# Install HCO (kubevirt and helper operators)

export HCO_IMAGE_VER=${HCO_IMAGE_VER:-"1.11.0-unstable"}
export HCO_GIT_TAG=${HCO_GIT_TAG:-"main"}
export HCO_SUBSCRIPTION_CHANNEL=${HCO_SUBSCRIPTION_CHANNEL:-"candidate-v1.11"}
export VIRTCTL_VERSION="v1.0.1"
export HPP_VERSION="release-v0.18"

cat <<EOF | oc apply -f -
apiVersion: operators.coreos.com/v1alpha1
kind: CatalogSource
metadata:
  name: hco-unstable-catalog-source
  namespace: openshift-marketplace
spec:
  sourceType: grpc
  image: quay.io/kubevirt/hyperconverged-cluster-index:${HCO_IMAGE_VER}
  displayName: Kubevirt Hyperconverged Cluster Operator
  publisher: Kubevirt Project
EOF

cat <<EOF | oc apply -f -
apiVersion: v1
kind: Namespace
metadata:
    name: kubevirt-hyperconverged
---
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
    name: kubevirt-hyperconverged-group
    namespace: kubevirt-hyperconverged
---
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
    name: hco-operatorhub
    namespace: kubevirt-hyperconverged
spec:
    source: hco-unstable-catalog-source
    sourceNamespace: openshift-marketplace
    name: community-kubevirt-hyperconverged
    channel: ${HCO_SUBSCRIPTION_CHANNEL}
EOF


# Wait for HCO cr to be created
sleep 60

export hco_cr_is_created="false"

for i in {1..20}
do
  echo "Attempt ${i}/20"
  if oc create -f https://raw.githubusercontent.com/kubevirt/hyperconverged-cluster-operator/${HCO_GIT_TAG}/deploy/hco.cr.yaml -n kubevirt-hyperconverged; then
    echo "HCO cr is created"
    export hco_cr_is_created="true"
    break
  fi
  sleep 30
done

if [[ "$hco_cr_is_created" == "false" ]]; then
  echo "Error: HCO cr didn't get created!!"
  exit 1
fi

# Wait for kubevirt virt-operator to be available
sleep 60

export virt_operator_is_available="false"

for i in {1..20}
do
  echo "Attempt ${i}/20"
  if oc -n kubevirt-hyperconverged wait deployment/virt-operator --for=condition=Available --timeout="10m"; then
    echo "virt-operator is Available"
    export virt_operator_is_available="true"
    break
  fi
  sleep 30
done

if [[ "$virt_operator_is_available" == "false" ]]; then
  echo "Error: virt-operator is not available!!"
  exit 1
fi

# ----------------------------------------------------------------------------------------------------
# Create storage class and storage namespace for testing
# Install HPP

# Configure SELinux when using OpenShift to allow HPP to create storage on workers
oc create -f \
  https://raw.githubusercontent.com/kubevirt/hostpath-provisioner-operator/${HPP_VERSION}/contrib/machineconfig-selinux-hpp.yaml

wait_mcp_for_updated

oc create -f \
  https://raw.githubusercontent.com/kubevirt/hostpath-provisioner-operator/${HPP_VERSION}/deploy/hostpathprovisioner_cr.yaml

cat <<EOF | oc apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: hostpath-provisioner
provisioner: kubevirt.io.hostpath-provisioner
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
parameters:
  storagePool: local
EOF

# Set HPP as default StorageClass for the cluster
oc annotate storageclasses --all storageclass.kubernetes.io/is-default-class-
oc annotate storageclass hostpath-provisioner storageclass.kubernetes.io/is-default-class='true'

# ----------------------------------------------------------------------------------------------------
# Download virtctl tool if needed
command -v virtctl1 &> /dev/null || download_virtctl
