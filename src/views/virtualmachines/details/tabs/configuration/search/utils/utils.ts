import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';

import { SearchItem } from '../../utils/search';

export const createConfigurationSearchURL = (
  tab: string,
  element: string,
  pathname: string,
): string => {
  return pathname?.endsWith(VirtualMachineDetailsTab.Configurations)
    ? `${VirtualMachineDetailsTab.Configurations}/${tab}#${element}`
    : `${tab}#${element}`;
};

export const getSearchItemsIds = (searchItems: SearchItem[]): string[] =>
  searchItems.map((item) => item.id);
