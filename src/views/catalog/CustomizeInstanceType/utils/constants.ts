import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';
import { getTabHrefAndName } from '@virtualmachines/details/utils/utils';

import CustomizeInstanceTypeConfigurationTab from '../tabs/configuration/CustomizeInstanceTypeConfigurationTab';
import CustomizeInstanceTypeYamlTab from '../tabs/yaml/CustomizeInstanceTypeYamlTab';

export const pages = [
  {
    component: CustomizeInstanceTypeYamlTab,
    href: '',
    name: VirtualMachineDetailsTabLabel.yaml,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    ...getTabHrefAndName(VirtualMachineDetailsTab.Configurations),
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    ...getTabHrefAndName(VirtualMachineDetailsTab.SSH),
    isHidden: true,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    ...getTabHrefAndName(VirtualMachineDetailsTab.InitialRun),
    isHidden: true,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    ...getTabHrefAndName(VirtualMachineDetailsTab.Storage),
    isHidden: true,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    ...getTabHrefAndName(VirtualMachineDetailsTab.Details),
    isHidden: true,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    ...getTabHrefAndName(VirtualMachineDetailsTab.Metadata),
    isHidden: true,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    ...getTabHrefAndName(VirtualMachineDetailsTab.Network),
    isHidden: true,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    ...getTabHrefAndName(VirtualMachineDetailsTab.Scheduling),
    isHidden: true,
  },
];
