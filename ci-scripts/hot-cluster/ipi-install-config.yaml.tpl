apiVersion: v1
metadata:
  name: ${CLUSTER_NAME}
baseDomain: ${BASE_DOMAIN}
credentialsMode: Manual
platform:
  ibmcloud:
    region: ${VPC_REGION}
    resourceGroupName: ${IBM_RESOURCE_GROUP}
controlPlane:
  architecture: amd64
  hyperthreading: Enabled
  name: master
  replicas: 3
  platform:
    ibmcloud:
      type: ${CONTROL_PLANE_FLAVOR}
compute:
  - architecture: amd64
    hyperthreading: Enabled
    name: worker
    replicas: ${WORKER_COUNT}
    platform:
      ibmcloud:
        type: ${IPI_WORKER_FLAVOR}
networking:
  networkType: OVNKubernetes
  clusterNetwork:
    - cidr: 10.128.0.0/14
      hostPrefix: 23
  serviceNetwork:
    - 172.30.0.0/16
publish: External
pullSecret: '${PULL_SECRET}'
sshKey: '${SSH_PUB}'
