#!/bin/bash

set -ex

export DOWNSTREAM=true

# export node
get_node() {
    local index=$1
    oc get node -l cpumanager=true | awk -v line="$((index+1))" 'NR==line {print $1}'
}

export CYPRESS_FIRST_NODE=$(get_node 1)
export CYPRESS_SECOND_NODE=$(get_node 2)
export CYPRESS_THIRD_NODE=$(get_node 3)

# detect NIC port
declare -a NIC_PATTERNS=("lab.eng.rdu2.redhat.com" "ens10" "enp10s0")
declare -a NIC_NAMES=("eno4" "ens10" "enp10s0")

for i in "${!NIC_PATTERNS[@]}"; do
    if oc get NodeNetworkState "$CYPRESS_FIRST_NODE" -o yaml | grep -q "${NIC_PATTERNS[$i]}"; then
        export CYPRESS_NNCP_NIC="${NIC_NAMES[$i]}"
        break
    fi
done
echo "CYPRESS_NNCP_NIC: ${CYPRESS_NNCP_NIC:-Not Found}"

# MTC
if oc get migplans --all-namespaces &>/dev/null; then
    export CYPRESS_MTC=true
else
    export CYPRESS_MTC=false
fi
echo "CYPRESS_MTC: $CYPRESS_MTC"

# artifactory
echo "CYPRESS_ARTIFACTORY_SERVER: $CYPRESS_ARTIFACTORY_SERVER"
export CYPRESS_ARTIFACTORY_PATH="artifactory/cnv-qe-server-local"
export CYPRESS_LOCAL_IMAGE="/tmp/cirros.xz"
export CYPRESS_CIRROS_IMAGE="https://${CYPRESS_ARTIFACTORY_SERVER}/${CYPRESS_ARTIFACTORY_PATH}/cnv-tests/cirros-images/cirros-0.5.2-x86_64-disk.qcow2.xz"

health_check() {
    local ret=0
    echo "Health checklist before console test."

    # 1 - download images 
    if ! curl "${CYPRESS_CIRROS_IMAGE}" -u"${CYPRESS_ARTIFACTORY_USER}:${CYPRESS_ARTIFACTORY_TOKEN}" -kL -o "${CYPRESS_LOCAL_IMAGE}"; then
        echo "Failed to download image from artifactory"
        return 1
    fi

    # 2 - upload pvc
    if ! virtctl image-upload -n auto-test-ns pvc auto-test-pvc --size=1Gi --image-path="${CYPRESS_LOCAL_IMAGE}" --insecure --force-bind; then
        echo "PVC upload test failed"
        return 1
    fi

    # 3 - create vm from CLI
    oc delete -f data/vm.yaml --ignore-not-found
    if ! oc create -f data/vm.yaml || 
       ! oc wait --for=condition=ready vm/rhel-10-vm --timeout=360s; then
        echo "VM creation test failed"
        return 1
    fi
    oc delete -f data/vm.yaml

    return 0
}

health_check
