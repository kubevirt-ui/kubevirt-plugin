import { type V1beta1NetworkMapSpecMap, type V1beta1StorageMapSpecMap } from '@forklift-ui/types';

import { POD_NETWORK_TYPE } from './constants';

export const getNetworkMapRowId = (map: V1beta1NetworkMapSpecMap): string => {
  if (map.source.type === POD_NETWORK_TYPE) {
    return POD_NETWORK_TYPE;
  }

  if (map.source.namespace && map.source.name) {
    return `${map.source.namespace}/${map.source.name}`;
  }

  return map.source.name ?? '';
};

export const getNetworkDestinationSelectValue = (map: V1beta1NetworkMapSpecMap): string => {
  if (map.destination?.type === POD_NETWORK_TYPE) {
    return POD_NETWORK_TYPE;
  }

  if (map.destination?.namespace && map.destination?.name) {
    return `${map.destination.namespace}/${map.destination.name}`;
  }

  return '';
};

export const getStorageDestinationSelectValue = (map: V1beta1StorageMapSpecMap): string =>
  map.destination?.storageClass ?? '';
