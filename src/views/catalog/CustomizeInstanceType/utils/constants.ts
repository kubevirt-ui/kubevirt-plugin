import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';

import CustomizeInstanceTypeConfigurationTab from '../tabs/configuration/CustomizeInstanceTypeConfigurationTab';
import CustomizeInstanceTypeYamlTab from '../tabs/yaml/CustomizeInstanceTypeYamlTab';

export const pages = [
  {
    component: CustomizeInstanceTypeYamlTab,
    href: '',
    name: VirtualMachineDetailsTabLabel.YAML,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    href: VirtualMachineDetailsTab.Configurations,
    name: VirtualMachineDetailsTabLabel.Configuration,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.SSH}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.SSH}`,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab['Initial-run']}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab['Initial-run']}`,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Storage}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Storage}`,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Details}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Details}`,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Metadata}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Metadata}`,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Network}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Network}`,
  },
  {
    component: CustomizeInstanceTypeConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Scheduling}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Scheduling}`,
  },
];
