import { TFunction } from 'react-i18next';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec, V1ContainerDiskSource } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getTemplateContainerDisks,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template';

import {
  BLANK_SOURCE_NAME,
  CONTAINER_DISK_SOURCE_NAME,
  DEFAULT_SOURCE,
  HTTP_SOURCE_NAME,
  PVC_SOURCE_NAME,
  REGISTRY_SOURCE_NAME,
  SOURCE_OPTIONS_IDS,
} from './constants';

export const getSourceTypeFromDiskSource = (
  diskSource: V1beta1DataVolumeSpec | V1ContainerDiskSource,
): SOURCE_OPTIONS_IDS => {
  if ((diskSource as V1ContainerDiskSource).image) return CONTAINER_DISK_SOURCE_NAME;

  if ((diskSource as V1beta1DataVolumeSpec).source.blank) return BLANK_SOURCE_NAME;
  if ((diskSource as V1beta1DataVolumeSpec).source.http) return HTTP_SOURCE_NAME;
  if ((diskSource as V1beta1DataVolumeSpec).source.registry) return REGISTRY_SOURCE_NAME;
  if ((diskSource as V1beta1DataVolumeSpec).source.pvc) return PVC_SOURCE_NAME;

  return DEFAULT_SOURCE;
};

export const getGenericSourceCustomization = (
  diskSourceId: SOURCE_OPTIONS_IDS,
  url?: string,
  storage?: string,
): V1beta1DataVolumeSpec => {
  const dataVolumeSpec: V1beta1DataVolumeSpec = {
    source: {
      [diskSourceId]: {},
    },
    storage: {
      resources: {
        requests: {
          storage: storage ?? '30Gi',
        },
      },
    },
  };

  if (url) dataVolumeSpec.source[diskSourceId].url = url;

  return dataVolumeSpec;
};

export const getContainerDiskSource = (imageURL: string): V1ContainerDiskSource => ({
  image: imageURL,
});

export const getPVCSource = (
  pvcName: string,
  pvcNamespace: string,
  storage?: string,
): V1beta1DataVolumeSpec => {
  const dataVolumeSpec: V1beta1DataVolumeSpec = {
    source: {
      pvc: {
        name: pvcName,
        namespace: pvcNamespace,
      },
    },
  };

  if (storage)
    dataVolumeSpec.storage = {
      resources: {
        requests: {
          storage,
        },
      },
    };

  return dataVolumeSpec;
};

export const getTemplateStorageQuantity = (template: V1Template): string | undefined => {
  const dataVolumeTemplates = getTemplateVirtualMachineObject(template)?.spec?.dataVolumeTemplates;

  return dataVolumeTemplates?.[0]?.spec?.storage?.resources?.requests?.storage;
};

export const getRegistryHelperText = (template: V1Template, t: TFunction) => {
  const containerDisks = getTemplateContainerDisks(template);

  if (containerDisks && containerDisks.length > 0)
    return t('Enter a container image (for example: {{containerDisk}})', {
      containerDisk: containerDisks[0],
    });
};

const DOCKER_PREFIX = 'docker://';

export const appendDockerPrefix = (image: string) => {
  return image?.startsWith(DOCKER_PREFIX) ? image : DOCKER_PREFIX.concat(image);
};
export const removeDockerPrefix = (image: string) => image?.replace(DOCKER_PREFIX, '');
