import xbytes from 'xbytes';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1beta1DataVolumeSource,
  V1beta1DataVolumeSpec,
  V1ContainerDiskSource,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { removeByteSuffix } from '@kubevirt-utils/components/CapacityInput/utils';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/state/initialState';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateContainerDisks } from '@kubevirt-utils/resources/template';
import { hasSizeUnit } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  BLANK_SOURCE_NAME,
  CONTAINER_DISK_SOURCE_NAME,
  DEFAULT_SOURCE,
  HTTP_SOURCE_NAME,
  PVC_SOURCE_NAME,
  REGISTRY_SOURCE_NAME,
  SOURCE_OPTIONS_IDS,
  UPLOAD_SOURCE_NAME,
} from '../constants';

export const getQuantityFromSource = (source: V1beta1DataVolumeSpec) => {
  const storage = source?.storage?.resources?.requests?.storage;
  const quantity = hasSizeUnit(storage)
    ? storage
    : xbytes(Number(storage), { iec: true, space: false });

  return removeByteSuffix(quantity);
};

export const getSourceTypeFromDiskSource = (
  diskSource: V1beta1DataVolumeSpec | V1ContainerDiskSource,
): SOURCE_OPTIONS_IDS => {
  if ('image' in diskSource) return CONTAINER_DISK_SOURCE_NAME;

  const dataVolumeSource = diskSource.source as V1beta1DataVolumeSource;

  if (isEmpty(dataVolumeSource)) return DEFAULT_SOURCE;

  if (dataVolumeSource?.blank) return BLANK_SOURCE_NAME;
  if (dataVolumeSource?.http) return HTTP_SOURCE_NAME;
  if (dataVolumeSource?.registry) return REGISTRY_SOURCE_NAME;
  if (dataVolumeSource?.pvc) return PVC_SOURCE_NAME;
  if (dataVolumeSource?.upload) return UPLOAD_SOURCE_NAME;

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
          storage: storage ?? DEFAULT_DISK_SIZE,
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

export const getRegistryHelperText = (template: V1Template) => {
  const containerDisks = getTemplateContainerDisks(template);

  if (containerDisks && containerDisks.length > 0)
    return t('Enter a container image (for example: {{containerDisk}})', {
      containerDisk: containerDisks[0],
    });
};
