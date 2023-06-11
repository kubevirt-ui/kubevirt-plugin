import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  ConfigMapModel,
  PersistentVolumeClaimModel,
  SecretModel,
  ServiceAccountModel,
} from '@kubevirt-utils/models';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

// t('Other')
export const OTHER = 'Other';
// t('Container (Ephemeral)')
export const CONTAINER_EPHERMAL = 'Container (Ephemeral)';
// t('Dynamic')
export const DYNAMIC = 'Dynamic';

export const sourceTypes = {
  BLANK: 'blank',
  CLONE_PVC: 'pvc',
  DATA_SOURCE: 'dataSource',
  EPHEMERAL: 'containerDisk',
  HTTP: 'http',
  PVC: 'persistentVolumeClaim', // Existing PVC
  REGISTRY: 'registry',
  UPLOAD: 'upload',
};

export const volumeTypes = {
  CLOUD_INIT_CONFIG_DRIVE: 'cloudInitConfigDrive',
  CLOUD_INIT_NO_CLOUD: 'cloudInitNoCloud',
  CONFIG_MAP: 'configMap',
  CONTAINER_DISK: 'containerDisk',
  DATA_VOLUME: 'dataVolume',
  PERSISTENT_VOLUME_CLAIM: 'persistentVolumeClaim',
  SECRET: 'secret',
  SERVICE_ACCOUNT: 'serviceAccount',
};

export const mapVolumeTypeToK8sModel = {
  [volumeTypes.CONFIG_MAP]: ConfigMapModel,
  [volumeTypes.DATA_VOLUME]: DataVolumeModel,
  [volumeTypes.PERSISTENT_VOLUME_CLAIM]: PersistentVolumeClaimModel,
  [volumeTypes.SECRET]: SecretModel,
  [volumeTypes.SERVICE_ACCOUNT]: ServiceAccountModel,
};

export const mapSourceTypeToVolumeType = {
  [OTHER]: OTHER,
  [sourceTypes.BLANK]: volumeTypes.DATA_VOLUME,
  [sourceTypes.CLONE_PVC]: volumeTypes.DATA_VOLUME,
  [sourceTypes.DATA_SOURCE]: volumeTypes.DATA_VOLUME,
  [sourceTypes.EPHEMERAL]: volumeTypes.CONTAINER_DISK,
  [sourceTypes.HTTP]: volumeTypes.DATA_VOLUME,
  [sourceTypes.PVC]: volumeTypes.PERSISTENT_VOLUME_CLAIM,
  [sourceTypes.REGISTRY]: volumeTypes.DATA_VOLUME,
  [sourceTypes.UPLOAD]: volumeTypes.PERSISTENT_VOLUME_CLAIM,
  [volumeTypes.CLOUD_INIT_NO_CLOUD]: OTHER,
  [volumeTypes.CONFIG_MAP]: OTHER,
  [volumeTypes.DATA_VOLUME]: volumeTypes.DATA_VOLUME,
  [volumeTypes.SECRET]: OTHER,
  [volumeTypes.SERVICE_ACCOUNT]: OTHER,
};

export const interfaceTypes = {
  SATA: 'sata',
  SCSI: 'scsi',
  VIRTIO: 'virtio',
};

export const osNames = {
  centos7: 'centos7',
  centos8: 'centos8',
  centosStream8: 'centos-stream8',
  centosStream9: 'centos-stream9',
  fedora: 'fedora',
  rhel7: 'rhel7',
  rhel8: 'rhel8',
  win10: 'win10',
  win2k: 'win2k',
};

export const OS_REGISTERY_LINKS = {
  [osNames.centos7]: 'quay.io/containerdisks/centos:7-2009',
  [osNames.centos8]: 'quay.io/containerdisks/centos:8.4',
  [osNames.centosStream8]: 'quay.io/containerdisks/centos-stream:8',
  [osNames.centosStream9]: 'quay.io/containerdisks/centos-stream:9',
  [osNames.fedora]: 'quay.io/containerdisks/fedora:latest',
  [osNames.rhel7]: 'registry.redhat.io/rhel7/rhel-guest-image:latest',
  [osNames.rhel8]: 'registry.redhat.io/rhel8/rhel-guest-image:latest',
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
    claimPropertySets?: {
      accessModes: string[];
      volumeMode?: string;
    }[];
    cloneStrategy?: string;
    provisioner: string;
    storageClass: string;
  };
} & K8sResourceCommon;
