import { TFunction } from 'react-i18next';

import {
  getVirtualMachineDetailsTabLabel,
  VirtualMachineDetailsTab,
} from '@kubevirt-utils/constants/tabs-constants';
import { getTabHrefAndName } from '@virtualmachines/details/utils/utils';

import CustomizeInstanceTypeConfigurationTab from '../tabs/configuration/CustomizeInstanceTypeConfigurationTab';
import CustomizeInstanceTypeYamlTab from '../tabs/yaml/CustomizeInstanceTypeYamlTab';

export const getPages = (t: TFunction) => {
  const tabLabels = getVirtualMachineDetailsTabLabel(t);
  return [
    {
      component: CustomizeInstanceTypeYamlTab,
      href: '',
      name: tabLabels[VirtualMachineDetailsTab.YAML],
    },
    {
      component: CustomizeInstanceTypeConfigurationTab,
      ...getTabHrefAndName(VirtualMachineDetailsTab.Configurations, t),
    },
    {
      component: CustomizeInstanceTypeConfigurationTab,
      ...getTabHrefAndName(VirtualMachineDetailsTab.SSH, t),
      isHidden: true,
    },
    {
      component: CustomizeInstanceTypeConfigurationTab,
      ...getTabHrefAndName(VirtualMachineDetailsTab.InitialRun, t),
      isHidden: true,
    },
    {
      component: CustomizeInstanceTypeConfigurationTab,
      ...getTabHrefAndName(VirtualMachineDetailsTab.Storage, t),
      isHidden: true,
    },
    {
      component: CustomizeInstanceTypeConfigurationTab,
      ...getTabHrefAndName(VirtualMachineDetailsTab.Details, t),
      isHidden: true,
    },
    {
      component: CustomizeInstanceTypeConfigurationTab,
      ...getTabHrefAndName(VirtualMachineDetailsTab.Metadata, t),
      isHidden: true,
    },
    {
      component: CustomizeInstanceTypeConfigurationTab,
      ...getTabHrefAndName(VirtualMachineDetailsTab.Network, t),
      isHidden: true,
    },
    {
      component: CustomizeInstanceTypeConfigurationTab,
      ...getTabHrefAndName(VirtualMachineDetailsTab.Scheduling, t),
      isHidden: true,
    },
  ];
};
