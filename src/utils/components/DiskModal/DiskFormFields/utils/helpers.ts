import { TFunction } from 'i18next';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1DataVolumeTemplateSpec, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

import { interfaceTypes, sourceTypes, volumeTypes } from './constants';

export const getSourceOptions = (t: TFunction) => ({
  blank: {
    description: t('Create an empty disk.'),
    id: sourceTypes.BLANK,
    name: t('Blank (creates PVC)'),
  },
  clonePvc: {
    description: t(
      'Select an existing persistent volume claim already available on the cluster and clone it.',
    ),
    id: sourceTypes.CLONE_PVC,
    name: t('PVC (creates PVC)'),
  },
  container: {
    description: t(
      'Upload content from a container located in a registry accessible from the cluster. The container disk is meant to be used only for read-only filesystems such as CD-ROMs or for small short-lived throw-away VMs.',
    ),
    id: sourceTypes.EPHEMERAL,
    name: t('Container (ephemeral)'),
  },
  dataSource: {
    description: t('Select DataSource to use for automatic image upload.'),
    id: sourceTypes.DATA_SOURCE,
    name: t('PVC auto import (use DataSource)'),
  },
  http: {
    description: t('Import content via URL (HTTP or HTTPS endpoint).'),
    id: sourceTypes.HTTP,
    name: t('URL (creates PVC)'),
  },
  pvc: {
    description: t('Use a persistent volume claim (PVC) already available on the cluster.'),
    id: sourceTypes.PVC,
    name: t('Use an existing PVC'),
  },
  registry: {
    description: t('Import content via container registry.'),
    id: sourceTypes.REGISTRY,
    name: t('Registry (creates PVC)'),
  },
  upload: {
    description: t('Upload a new file to PVC. a new PVC will be created.'),
    id: sourceTypes.UPLOAD,
    name: t('Upload (Upload a new file to PVC)'),
  },
});

export const getURLSourceHelpertText = (t: TFunction, os: OS_NAME_TYPES) => {
  switch (os) {
    case OS_NAME_TYPES.rhel:
      return {
        afterLabelText: t(
          '(requires login) and copy the download link URL of the KVM guest image (expires quickly)',
        ),
        beforeLabelText: t('Example: For RHEL, visit the '),
        label: t('RHEL download page '),
      };
    case OS_NAME_TYPES.centos:
      return {
        afterLabelText: t('and copy the download link URL for the cloud base image'),
        beforeLabelText: t('Example: For CentOS, visit the '),
        label: t('CentOS cloud image list '),
      };
    case OS_NAME_TYPES.windows:
      return {
        afterLabelText: t('and copy the download link URL'),
        beforeLabelText: t('Example: For Windows, get a link to the '),
        label: t('installation iso of Microsoft Windows 10 '),
      };
    case OS_NAME_TYPES.fedora:
    default:
      return {
        afterLabelText: t('and copy the download link URL for the cloud base image'),
        beforeLabelText: t('Example: For Fedora, visit the '),
        label: t('Fedora cloud image list '),
      };
  }
};

export const getInterfaceOptions = (t: TFunction) => ({
  sata: {
    description: t(
      'Supported by most operating systems including Windows out of the box. Offers lower performance compared to virtio. Consider using it for CD-ROM devices.',
    ),
    id: interfaceTypes.SATA,
    name: t('SATA'),
  },
  scsi: {
    description: t(
      'Paravirtualized iSCSI HDD driver offers similar functionality to the virtio-block device, with some additional enhancements. In particular, this driver supports adding hundreds of devices, and names devices using the standard SCSI device naming scheme.',
    ),
    id: interfaceTypes.SCSI,
    name: t('SCSI'),
  },
  virtio: {
    description: t(
      'Optimized for best performance. Supported by most Linux distributions. Windows requires additional drivers to use this model.',
    ),
    id: interfaceTypes.VIRTIO,
    name: t('VirtIO'),
  },
});

export const getVolumeType = (volume: V1Volume): string => {
  const volumeType = Object.keys(volume)?.find((key) => Object.values(volumeTypes).includes(key));
  return volumeType;
};

export const getDataVolumeTemplateSourceType = (dvTemplate: V1DataVolumeTemplateSpec): string => {
  const sourceType = Object.keys(dvTemplate?.spec?.source).find((key) =>
    Object.values(sourceTypes).includes(key),
  );
  return sourceType;
};

export const getVolumeResourceName = (volume: V1Volume): string => {
  const volumeType = getVolumeType(volume);
  if (volumeType === volumeTypes.PERSISTENT_VOLUME_CLAIM) {
    return volume?.persistentVolumeClaim?.claimName;
  }
  if (volumeType === volumeTypes.DATA_VOLUME || volumeType === volumeTypes.CONFIG_MAP) {
    return volume?.[volumeType]?.name;
  }
  if (volumeType === volumeTypes.SECRET) {
    return volume?.[volumeType]?.secretName;
  }
  if (volumeType === volumeTypes.SERVICE_ACCOUNT) {
    return volume?.[volumeType]?.serviceAccountName;
  }
  return null;
};

export const isDefaultStorageClass = (storageClass: IoK8sApiStorageV1StorageClass): boolean =>
  storageClass?.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class'] === 'true';

export const getDefaultStorageClass = (
  storageClasses: IoK8sApiStorageV1StorageClass[],
): IoK8sApiStorageV1StorageClass => storageClasses?.find(isDefaultStorageClass);

export const generateDiskName = () => {
  return `disk-${uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  })}`;
};
