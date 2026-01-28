import { TFunction } from 'react-i18next';

import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { PhysicalNetworks } from '../../../../../utils/types';

import { NetworksSearchType } from './types';

const filterByName = (physicalNetworks: PhysicalNetworks, searchInput: string): PhysicalNetworks =>
  physicalNetworks.filter((network) => network.name?.includes(searchInput) ?? false);

const filterByNodeName = (
  physicalNetworks: PhysicalNetworks,
  searchInput: string,
): PhysicalNetworks =>
  physicalNetworks.filter((network) =>
    network.physicalNetworkNodes.some((node) => getName(node)?.includes(searchInput) ?? false),
  );

const filterByConfigurationName = (
  physicalNetworks: PhysicalNetworks,
  searchInput: string,
): PhysicalNetworks =>
  physicalNetworks.filter((network) =>
    network.nncps.some((configuration) => getName(configuration)?.includes(searchInput) ?? false),
  );

export const filterPhysicalNetworks = (
  physicalNetworks: PhysicalNetworks,
  searchType: NetworksSearchType,
  searchInput: string,
): PhysicalNetworks => {
  if (!searchInput || isEmpty(physicalNetworks)) return physicalNetworks;

  switch (searchType) {
    case NetworksSearchType.NAME:
      return filterByName(physicalNetworks, searchInput);
    case NetworksSearchType.NODES:
      return filterByNodeName(physicalNetworks, searchInput);
    case NetworksSearchType.CONFIGURATIONS:
      return filterByConfigurationName(physicalNetworks, searchInput);
    default:
      return physicalNetworks;
  }
};

export const getNetworkSearchLabels = (t: TFunction): Record<NetworksSearchType, string> => {
  return {
    [NetworksSearchType.CONFIGURATIONS]: t('Configuration name'),
    [NetworksSearchType.NAME]: t('Name'),
    [NetworksSearchType.NODES]: t('Nodes'),
  };
};

export const getNetworkSearchLabelByType = (searchType: NetworksSearchType, t: TFunction): string =>
  getNetworkSearchLabels(t)[searchType];
