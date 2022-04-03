import { TFunction } from 'i18next';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1DataVolumeTemplateSpec, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

import { interfaceTypes, sourceTypes, volumeTypes } from './constants';

export const getSourceOptions = (t: TFunction) => ({
  blank: {
    id: sourceTypes.BLANK,
    name: t('Blank (creates PVC)'),
    description: t('Create an empty disk.'),
  },
  http: {
    id: sourceTypes.HTTP,
    name: t('URL (creates PVC)'),
    description: t('Import content via URL (HTTP or S3 endpoint).'),
  },
  pvc: {
    id: sourceTypes.PVC,
    name: t('Use an existing PVC'),
    description: t('Use a persistent volume claim (PVC) already available on the cluster.'),
  },
  clonePvc: {
    id: sourceTypes.CLONE_PVC,
    name: t('PVC (creates PVC)'),
    description: t(
      'Select an existing persistent volume claim already available on the cluster and clone it.',
    ),
  },
  registry: {
    id: sourceTypes.REGISTRY,
    name: t('Registry (creates PVC)'),
    description: t('Import content via container registry.'),
  },
  container: {
    id: sourceTypes.EPHEMERAL,
    name: t('Container (ephemeral)'),
    description: t(
      'Upload content from a container located in a registry accessible from the cluster. The container disk is meant to be used only for read-only filesystems such as CD-ROMs or for small short-lived throw-away VMs.',
    ),
  },
});

export const getURLSourceHelpertText = (t: TFunction, os: OS_NAME_TYPES) => {
  switch (os) {
    case OS_NAME_TYPES.rhel:
      return {
        beforeLabelText: t('Example: For RHEL, visit the '),
        label: t('RHEL download page '),
        afterLabelText: t(
          '(requires login) and copy the download link URL of the KVM guest image (expires quickly)',
        ),
      };
    case OS_NAME_TYPES.centos:
      return {
        beforeLabelText: t('Example: For CentOS, visit the '),
        label: t('CentOS cloud image list '),
        afterLabelText: t('and copy the download link URL for the cloud base image'),
      };
    case OS_NAME_TYPES.windows:
      return {
        beforeLabelText: t('Example: For Windows, get a link to the '),
        label: t('installation iso of Microsoft Windows 10 '),
        afterLabelText: t('and copy the download link URL'),
      };
    case OS_NAME_TYPES.fedora:
    default:
      return {
        beforeLabelText: t('Example: For Fedora, visit the '),
        label: t('Fedora cloud image list '),
        afterLabelText: t('and copy the download link URL for the cloud base image'),
      };
  }
};

export const getInterfaceOptions = (t: TFunction) => ({
  virtio: {
    id: interfaceTypes.VIRTIO,
    name: t('VirtIO'),
    description: t(
      'Optimized for best performance. Supported by most Linux distributions. Windows requires additional drivers to use this model.',
    ),
  },
  sata: {
    id: interfaceTypes.SATA,
    name: t('SATA'),
    description: t(
      'Supported by most operating systems including Windows out of the box. Offers lower performance compared to virtio. Consider using it for CD-ROM devices.',
    ),
  },
  scsi: {
    id: interfaceTypes.SCSI,
    name: t('SCSI'),
    description: t(
      'Paravirtualized iSCSI HDD driver offers similar functionality to the virtio-block device, with some additional enhancements. In particular, this driver supports adding hundreds of devices, and names devices using the standard SCSI device naming scheme.',
    ),
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
  Boolean(storageClass?.metadata?.annotations?.['storageclass.kubernetes.io/is-default-class']);

export const getDefaultStorageClass = (
  storageClasses: IoK8sApiStorageV1StorageClass[],
): IoK8sApiStorageV1StorageClass => storageClasses.find(isDefaultStorageClass);

export const generateDiskName = () => {
  return `disk-${uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  })}`;
};
