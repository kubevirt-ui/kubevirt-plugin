import { isUpstream } from '@kubevirt-utils/utils/utils';

export const UPSTREAM_STORAGE_CHECKUP_IMAGE_NAME = 'kubevirt-storage-checkup';
export const UPSTREAM_STORAGE_CHECKUP_IMAGE = 'quay.io/kiagnose/kubevirt-storage-checkup:main';
export const DOWNSTREAM_STORAGE_CHECKUP_IMAGE_NAME = 'kubevirt-storage-checkup-rhel9';
export const DOWNSTREAM_STORAGE_CHECKUP_IMAGE =
  'registry.redhat.io/container-native-virtualization/kubevirt-storage-checkup-rhel9:v4.19';
export const storageCheckupImageSettings = isUpstream
  ? {
      fallback: UPSTREAM_STORAGE_CHECKUP_IMAGE,
      name: UPSTREAM_STORAGE_CHECKUP_IMAGE_NAME,
    }
  : {
      fallback: DOWNSTREAM_STORAGE_CHECKUP_IMAGE,
      name: DOWNSTREAM_STORAGE_CHECKUP_IMAGE_NAME,
    };
