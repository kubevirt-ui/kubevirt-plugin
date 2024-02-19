import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1DataVolumeTemplateSpec, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getName } from '@kubevirt-utils/resources/shared';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { SelectOptionProps } from '@patternfly/react-core';

import { interfaceTypes, sourceTypes, volumeTypes } from './constants';

type DropdownOptionProps = {
  description: string;
  id: string;
  name: string;
};

export const sourceOptionTitles = {
  [sourceTypes.BLANK]: t('Blank (creates PVC)'),
  [sourceTypes.CLONE_PVC]: t('PVC (creates PVC)'),
  [sourceTypes.DATA_SOURCE]: t('PVC auto import (use DataSource)'),
  [sourceTypes.EPHEMERAL]: t('Container (ephemeral)'),
  [sourceTypes.HTTP]: t('URL (creates PVC)'),
  [sourceTypes.PVC]: t('Use an existing PVC'),
  [sourceTypes.REGISTRY]: t('Registry (creates PVC)'),
  [sourceTypes.UPLOAD]: t('Upload (Upload a new file to PVC)'),
};

export const getSourceOptions = (isTemplate: boolean): DropdownOptionProps[] => [
  {
    description: t('Create an empty disk.'),
    id: sourceTypes.BLANK,
    name: sourceOptionTitles[sourceTypes.BLANK],
  },
  {
    description: t(
      'Select an existing persistent volume claim already available on the cluster and clone it.',
    ),
    id: sourceTypes.CLONE_PVC,
    name: sourceOptionTitles[sourceTypes.CLONE_PVC],
  },
  {
    description: t(
      'Upload content from a container located in a registry accessible from the cluster. The container disk is meant to be used only for read-only filesystems such as CD-ROMs or for small short-lived throw-away VMs.',
    ),
    id: sourceTypes.EPHEMERAL,
    name: sourceOptionTitles[sourceTypes.EPHEMERAL],
  },
  {
    description: t('Select DataSource to use for automatic image upload.'),
    id: sourceTypes.DATA_SOURCE,
    name: sourceOptionTitles[sourceTypes.DATA_SOURCE],
  },
  {
    description: t('Import content via URL (HTTP or HTTPS endpoint).'),
    id: sourceTypes.HTTP,
    name: sourceOptionTitles[sourceTypes.HTTP],
  },
  {
    description: t('Use a persistent volume claim (PVC) already available on the cluster.'),
    id: sourceTypes.PVC,
    name: sourceOptionTitles[sourceTypes.PVC],
  },
  {
    description: t('Import content via container registry.'),
    id: sourceTypes.REGISTRY,
    name: sourceOptionTitles[sourceTypes.REGISTRY],
  },
  ...(!isTemplate
    ? [
        {
          description: t('Upload a new file to PVC. a new PVC will be created.'),
          id: sourceTypes.UPLOAD,
          name: sourceOptionTitles[sourceTypes.UPLOAD],
        },
      ]
    : []),
];

export const getURLSourceHelpertText = (os: OS_NAME_TYPES) => {
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

export const interfaceOptionTitles = {
  [interfaceTypes.SATA]: t('SATA'),
  [interfaceTypes.SCSI]: t('SCSI'),
  [interfaceTypes.VIRTIO]: t('VirtIO'),
};

export const getInterfaceOptions = (): DropdownOptionProps[] => [
  {
    description: t(
      'Supported by most operating systems including Windows out of the box. Offers lower performance compared to virtio. Consider using it for CD-ROM devices.',
    ),
    id: interfaceTypes.SATA,
    name: interfaceOptionTitles[interfaceTypes.SATA],
  },
  {
    description: t(
      'Paravirtualized iSCSI HDD driver offers similar functionality to the virtio-block device, with some additional enhancements. In particular, this driver supports adding hundreds of devices, and names devices using the standard SCSI device naming scheme.',
    ),
    id: interfaceTypes.SCSI,
    name: interfaceOptionTitles[interfaceTypes.SCSI],
  },
  {
    description: t(
      'Optimized for best performance. Supported by most Linux distributions. Windows requires additional drivers to use this model.',
    ),
    id: interfaceTypes.VIRTIO,
    name: interfaceOptionTitles[interfaceTypes.VIRTIO],
  },
];

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

export const getSCSelectOptions = (
  storageClasses: IoK8sApiStorageV1StorageClass[],
): SelectOptionProps[] =>
  storageClasses?.map((sc) => {
    const scName = getName(sc);
    const defaultSC = isDefaultStorageClass(sc) ? t('(default) | ') : '';
    const descriptionAnnotation = getAnnotation(sc, DESCRIPTION_ANNOTATION)?.concat(' | ') || '';
    const scType = sc?.parameters?.type ? ' | '.concat(sc?.parameters?.type) : '';
    const description = `${defaultSC}${descriptionAnnotation}${sc?.provisioner}${scType}`;

    return {
      children: scName,
      description,
      groupVersionKind: modelToGroupVersionKind(StorageClassModel),
      value: scName,
    };
  });
