import { NavPage } from '@openshift-console/dynamic-plugin-sdk';

import WizardAdvancedTab from './tabs/advanced/WizardAdvancedTab';
import WizardDisksTab from './tabs/disks/WizardDisksTab';
import WizardEnvironmentTab from './tabs/environment/WizardEnvironmentTab';
import WizardNetworkTab from './tabs/network/WizardNetworkTab';
import WizardOverviewTab from './tabs/overview/WizardOverviewTab';
import WizardSchedulingTab from './tabs/scheduling/WizardSchedulingTab';
import WizardScriptsTab from './tabs/scripts/WizardScriptsTab';
import WizardYAMLTab from './tabs/yaml/WizardYAMLTab';

export const wizardNavPages: NavPage[] = [
  {
    href: '',
    name: 'Overview',
    component: WizardOverviewTab,
  },
  {
    href: 'yaml',
    name: 'YAML',
    component: WizardYAMLTab,
  },
  {
    href: 'scheduling',
    name: 'Scheduling',
    component: WizardSchedulingTab,
  },
  {
    href: 'enviornment',
    name: 'Enviornment',
    component: WizardEnvironmentTab,
  },
  {
    href: 'network-interfaces',
    name: 'Network Interfaces',
    component: WizardNetworkTab,
  },
  {
    href: 'disks',
    name: 'Disks',
    component: WizardDisksTab,
  },
  {
    href: 'scripts',
    name: 'Scripts',
    component: WizardScriptsTab,
  },
  {
    href: 'advanced',
    name: 'Advanced',
    component: WizardAdvancedTab,
  },
];
