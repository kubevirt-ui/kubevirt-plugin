import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';

import { SearchItem } from '../../utils/search';

export const createConfigurationSearchURL = (
  tab: string,
  element: string,
  pathname: string,
): string => {
  const index = pathname?.lastIndexOf(VirtualMachineDetailsTab.Configurations);
  const substr = pathname.slice(0, index);
  return substr + `${VirtualMachineDetailsTab.Configurations}/${tab}#${element}`;
};

export const getSearchItemsIds = (searchItems: SearchItem[]): string[] =>
  searchItems.map((item) => item.id);
