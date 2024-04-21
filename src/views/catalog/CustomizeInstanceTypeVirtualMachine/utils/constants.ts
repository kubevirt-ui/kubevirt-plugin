import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';

import ConfigurationTab from '../tabs/configuration/ConfigurationTab';
import YamlTab from '../tabs/yaml/YamlTab';

export const pages = [
  {
    component: YamlTab,
    href: '',
    name: VirtualMachineDetailsTabLabel.YAML,
  },
  {
    component: ConfigurationTab,
    href: VirtualMachineDetailsTab.Configurations,
    name: VirtualMachineDetailsTabLabel.Configuration,
  },
  {
    component: ConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.SSH}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.SSH}`,
  },
  {
    component: ConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab['Initial-run']}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab['Initial-run']}`,
  },
  {
    component: ConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Storage}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Storage}`,
  },
  {
    component: ConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Details}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Details}`,
  },
  {
    component: ConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Metadata}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Metadata}`,
  },
  {
    component: ConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Network}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Network}`,
  },
  {
    component: ConfigurationTab,
    href: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Scheduling}`,
    isHidden: true,
    name: `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Scheduling}`,
  },
];
