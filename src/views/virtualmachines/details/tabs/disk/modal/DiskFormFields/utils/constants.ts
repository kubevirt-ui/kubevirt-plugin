import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const sourceTypes = {
  BLANK: 'blank',
  HTTP: 'http',
  PVC: 'pvc',
  CLONE_PVC: 'clonePvc',
  REGISTRY: 'registry',
  EPHEMERAL: 'containerDisk',
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
