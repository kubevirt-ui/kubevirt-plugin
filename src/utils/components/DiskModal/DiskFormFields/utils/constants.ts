import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  ConfigMapModel,
  PersistentVolumeClaimModel,
  SecretModel,
  ServiceAccountModel,
} from '@kubevirt-utils/models';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const OTHER = 'Other';
export const CONTAINER_EPHERMAL = 'Container (Ephemeral)';
export const DYNAMIC = 'Dynamic';

export const sourceTypes = {
  BLANK: 'blank',
  HTTP: 'http',
  CLONE_PVC: 'pvc',
  REGISTRY: 'registry',
  PVC: 'persistentVolumeClaim', // Existing PVC
  EPHEMERAL: 'containerDisk',
  DATA_SOURCE: 'dataSource',
};

export const volumeTypes = {
  DATA_VOLUME: 'dataVolume',
  PERSISTENT_VOLUME_CLAIM: 'persistentVolumeClaim',
  CONTAINER_DISK: 'containerDisk',
  CLOUD_INIT_CONFIG_DRIVE: 'cloudInitConfigDrive',
  CLOUD_INIT_NO_CLOUD: 'cloudInitNoCloud',
  CONFIG_MAP: 'configMap',
  SECRET: 'secret',
  SERVICE_ACCOUNT: 'serviceAccount',
};

export const mapVolumeTypeToK8sModel = {
  [volumeTypes.DATA_VOLUME]: DataVolumeModel,
  [volumeTypes.PERSISTENT_VOLUME_CLAIM]: PersistentVolumeClaimModel,
  [volumeTypes.CONFIG_MAP]: ConfigMapModel,
  [volumeTypes.SECRET]: SecretModel,
  [volumeTypes.SERVICE_ACCOUNT]: ServiceAccountModel,
};

export const mapSourceTypeToVolumeType = {
  [sourceTypes.BLANK]: volumeTypes.DATA_VOLUME,
  [sourceTypes.HTTP]: volumeTypes.DATA_VOLUME,
  [sourceTypes.CLONE_PVC]: volumeTypes.DATA_VOLUME,
  [sourceTypes.REGISTRY]: volumeTypes.DATA_VOLUME,
  [sourceTypes.PVC]: volumeTypes.PERSISTENT_VOLUME_CLAIM,
  [sourceTypes.EPHEMERAL]: volumeTypes.CONTAINER_DISK,
  [volumeTypes.CLOUD_INIT_NO_CLOUD]: OTHER,
  [volumeTypes.CONFIG_MAP]: OTHER,
  [volumeTypes.SECRET]: OTHER,
  [volumeTypes.SERVICE_ACCOUNT]: OTHER,
  [OTHER]: OTHER,
};

export const interfaceTypes = {
  VIRTIO: 'virtio',
  SATA: 'sata',
  SCSI: 'scsi',
};

export const osNames = {
  rhel7: 'rhel7',
  rhel8: 'rhel8',
  fedora: 'fedora',
  centos7: 'centos7',
  centos8: 'centos8',
  centosStream8: 'centos-stream8',
  centosStream9: 'centos-stream9',
  win10: 'win10',
  win2k: 'win2k',
};

export const OS_REGISTERY_LINKS = {
  [osNames.rhel7]: 'registry.redhat.io/rhel7/rhel-guest-image:latest',
  [osNames.rhel8]: 'registry.redhat.io/rhel8/rhel-guest-image:latest',
  [osNames.fedora]: 'quay.io/containerdisks/fedora:latest',
  [osNames.centos7]: 'quay.io/containerdisks/centos:7-2009',
  [osNames.centos8]: 'quay.io/containerdisks/centos:8.4',
  [osNames.centosStream8]: 'quay.io/containerdisks/centos-stream:8',
  [osNames.centosStream9]: 'quay.io/containerdisks/centos-stream:9',
  [osNames.win10]: null,
  [osNames.win2k]: null,
};

// type is not existing on kubevirt-api
export type StorageProfile = {
  spec: {
    claimPropertySets?: {
      accessModes: string[];
      volumeMode?: string;
    }[];
    cloneStrategy?: string;
  };
  status: {
    provisioner: string;
    storageClass: string;
    claimPropertySets?: {
      accessModes: string[];
      volumeMode?: string;
    }[];
    cloneStrategy?: string;
  };
} & K8sResourceCommon;
