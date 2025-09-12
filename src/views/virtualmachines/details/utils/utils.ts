import { TFunction } from 'react-i18next';

import {
  VirtualMachineConfigurationTabInner,
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';

export const getTabNameAndTitle = (tab: VirtualMachineDetailsTab, t: TFunction) => ({
  name: tab,
  title: t(VirtualMachineDetailsTabLabel[tab]),
});

export const getTabHrefAndName = (tab: VirtualMachineDetailsTab, t: TFunction) => {
  if (VirtualMachineConfigurationTabInner.has(tab)) {
    return {
      href: `${VirtualMachineDetailsTab.Configurations}/${tab}`,
      name: `${VirtualMachineDetailsTab.Configurations}/${tab}`,
    };
  }

  return {
    href: tab,
    name: t(VirtualMachineDetailsTabLabel[tab]),
  };
};
