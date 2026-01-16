import { TFunction } from 'react-i18next';

import {
  getVirtualMachineDetailsTabLabel,
  VirtualMachineConfigurationTabInner,
  VirtualMachineDetailsTab,
} from '@kubevirt-utils/constants/tabs-constants';

export const getTabNameAndTitle = (tab: VirtualMachineDetailsTab, t: TFunction) => {
  const tabLabels = getVirtualMachineDetailsTabLabel(t);
  return {
    name: tab,
    title: tabLabels[tab],
  };
};

export const getTabHrefAndName = (tab: VirtualMachineDetailsTab, t: TFunction) => {
  const tabLabels = getVirtualMachineDetailsTabLabel(t);
  if (VirtualMachineConfigurationTabInner.has(tab)) {
    return {
      href: `${VirtualMachineDetailsTab.Configurations}/${tab}`,
      name: `${VirtualMachineDetailsTab.Configurations}/${tab}`,
    };
  }

  return {
    href: tab,
    name: tabLabels[tab],
  };
};
