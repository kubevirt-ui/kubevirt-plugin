import {
  VirtualMachineConfigurationTabInner,
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';

export const getTabNameAndTitle = (tab: VirtualMachineDetailsTab) => ({
  name: tab,
  title: VirtualMachineDetailsTabLabel[tab],
});

export const getTabHrefAndName = (tab: VirtualMachineDetailsTab) => {
  if (VirtualMachineConfigurationTabInner.has(tab)) {
    return {
      href: `${VirtualMachineDetailsTab.Configurations}/${tab}`,
      name: `${VirtualMachineDetailsTab.Configurations}/${tab}`,
    };
  }

  return {
    href: tab,
    name: VirtualMachineDetailsTabLabel[tab],
  };
};
