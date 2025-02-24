#!/bin/bash
# artifactory environment variables from jenkins
#echo "CYPRESS_ARTIFACTORY_SERVER: $CYPRESS_ARTIFACTORY_SERVER"
#export CYPRESS_ARTIFACTORY_PATH="artifactory/cnv-qe-server-local"
#export CYPRESS_LOCAL_IMAGE="/tmp/cirros.xz"
#export CYPRESS_CIRROS_IMAGE="https://${CYPRESS_ARTIFACTORY_SERVER}/${CYPRESS_ARTIFACTORY_PATH}/cnv-tests/cirros-images/cirros-0.5.2-x86_64-disk.qcow2.xz"

health_check () {
  set -e
  echo "Health checklist before console test."

  #1 - download image from artifactory server
  curl ${CYPRESS_CIRROS_IMAGE} -u${CYPRESS_ARTIFACTORY_USER}:${CYPRESS_ARTIFACTORY_TOKEN} -kL -o ${CYPRESS_LOCAL_IMAGE}

  #2 - pvc upload is working
  virtctl image-upload -n default pvc auto-test-pvc --size=1Gi --image-path=${CYPRESS_LOCAL_IMAGE} --insecure --force-bind

  #3 - create VM from CLI to verify the webhook
  oc create -f cypress/fixtures/vm.yaml
  oc wait --for=condition=ready vm/rhel-10-vm --timeout=360s
  oc delete -f cypress/fixtures/vm.yaml
  set +e
}


