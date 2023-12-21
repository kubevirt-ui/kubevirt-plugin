import React from 'react';

import { NavPageKubevirt } from '@kubevirt-utils/components/HorizontalNavbar/utils/utils';

import { useWizardVMContext, WizardVMContextType } from '../utils/WizardVMContext';

import WizardDisksTab from './tabs/disks/WizardDisksTab';
import WizardEnvironmentTab from './tabs/environment/WizardEnvironmentTab';
import WizardMetadataTab from './tabs/metadata/WizardMetadataTab';
import WizardNetworkTab from './tabs/network/WizardNetworkTab';
import WizardOverviewTab from './tabs/overview/WizardOverviewTab';
import WizardSchedulingTab from './tabs/scheduling/WizardSchedulingTab';
import WizardScriptsTab from './tabs/scripts/WizardScriptsTab';
import WizardYAMLTab from './tabs/yaml/WizardYAMLTab';

export type WizardTab = React.VFC<WizardVMContextType>;

const withWizardVMContext = (Tab: WizardTab) => (routeProps) => {
  const vmContext = useWizardVMContext();

  return <Tab {...vmContext} {...routeProps} />;
};

export const wizardNavPages: NavPageKubevirt[] = [
  {
    component: withWizardVMContext(WizardOverviewTab),
    href: '',
    name: 'Overview',
  },
  {
    component: withWizardVMContext(WizardYAMLTab),
    href: 'yaml',
    name: 'YAML',
  },
  {
    component: withWizardVMContext(WizardSchedulingTab),
    href: 'scheduling',
    name: 'Scheduling',
  },
  {
    component: withWizardVMContext(WizardEnvironmentTab),
    href: 'environment',
    name: 'Environment',
  },
  {
    component: withWizardVMContext(WizardNetworkTab),
    href: 'network-interfaces',
    name: 'Network interfaces',
  },
  {
    component: withWizardVMContext(WizardDisksTab),
    href: 'disks',
    name: 'Disks',
  },
  {
    component: withWizardVMContext(WizardScriptsTab),
    href: 'scripts',
    name: 'Scripts',
  },
  {
    component: withWizardVMContext(WizardMetadataTab),
    href: 'metadata',
    name: 'Metadata',
  },
];
