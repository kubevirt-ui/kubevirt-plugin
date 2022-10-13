import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { SOURCE_OPTIONS_IDS, SOURCE_TYPES } from '../../utils/constants';
import { getDataSourceDataVolume } from '../editBootSource';

export const getDataVolumeSpec = async (
  dataSource: V1beta1DataSource,
): Promise<V1beta1DataVolumeSpec> => {
  const dataSourcePVCName = dataSource?.spec?.source?.pvc?.name;
  const dataSourcePVCNamespace = dataSource?.spec?.source?.pvc?.namespace;

  const dataVolume = await getDataSourceDataVolume(dataSourcePVCName, dataSourcePVCNamespace);

  return dataVolume?.spec;
};

export const getSourceTypeFromDataVolumeSpec = (dataVolumeSpec: V1beta1DataVolumeSpec) => {
  if (dataVolumeSpec?.source?.pvc) return SOURCE_TYPES.pvcSource;

  if (dataVolumeSpec?.source?.http) return SOURCE_TYPES.httpSource;

  if (dataVolumeSpec?.source?.registry) return SOURCE_TYPES.registrySource;
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

const DOCKER_PREFIX = 'docker://';

export const appendDockerPrefix = (image: string) => {
  return image?.startsWith(DOCKER_PREFIX) ? image : DOCKER_PREFIX.concat(image);
};
