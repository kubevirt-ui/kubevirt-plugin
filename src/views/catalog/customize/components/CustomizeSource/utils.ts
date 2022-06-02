import { TFunction } from 'react-i18next';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getTemplateContainerDisks,
  getTemplateImportURLs,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template';

import {
  BLANK_SOURCE_NAME,
  DEFAULT_SOURCE,
  HTTP_SOURCE_NAME,
  PVC_SOURCE_NAME,
  REGISTRY_SOURCE_NAME,
  SOURCE_OPTIONS_IDS,
} from './constants';

export const getSourceTypeFromDiskSource = (
  diskSource: V1beta1DataVolumeSpec,
): SOURCE_OPTIONS_IDS => {
  if (diskSource.source.blank) return BLANK_SOURCE_NAME;
  if (diskSource.source.http) return HTTP_SOURCE_NAME;
  if (diskSource.source.registry) return REGISTRY_SOURCE_NAME;
  if (diskSource.source.pvc) return PVC_SOURCE_NAME;

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

export const getHTTPHelperText = (template: V1Template, t: TFunction) => {
  const importUrls = getTemplateImportURLs(template);

  if (importUrls && importUrls.length > 0)
    return t('Enter URL to download (for example: {{importUrl}})', {
      importUrl: importUrls[0],
    });
};

export const getRegistryHelperText = (template: V1Template, t: TFunction) => {
  const containerDisks = getTemplateContainerDisks(template);

  if (containerDisks && containerDisks.length > 0)
    return t('Enter a container image (for example: {{containerDisk}})', {
      containerDisk: containerDisks[0],
    });
};

export const appendDockerPrefix = (image: string) => 'docker://'.concat(image);
