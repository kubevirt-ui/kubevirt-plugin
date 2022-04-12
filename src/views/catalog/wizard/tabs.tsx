import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { NavPage } from '@openshift-console/dynamic-plugin-sdk';

import { useWizardVMContext, WizardVMContextType } from '../utils/WizardVMContext';

import WizardDisksTab from './tabs/disks/WizardDisksTab';
import WizardEnvironmentTab from './tabs/environment/WizardEnvironmentTab';
import WizardMetadataTab from './tabs/metadata/WizardMetadataTab';
import WizardNetworkTab from './tabs/network/WizardNetworkTab';
import WizardOverviewTab from './tabs/overview/WizardOverviewTab';
import WizardSchedulingTab from './tabs/scheduling/WizardSchedulingTab';
import WizardScriptsTab from './tabs/scripts/WizardScriptsTab';
import WizardYAMLTab from './tabs/yaml/WizardYAMLTab';

type TabRouteProps = RouteComponentProps<{ ns: string }>;
export type WizardTab = React.VFC<TabRouteProps & WizardVMContextType>;

const withWizardVMContext = (Tab: WizardTab) => (routeProps: TabRouteProps) => {
  const vmContext = useWizardVMContext();

  return <Tab {...vmContext} {...routeProps} />;
};

export const wizardNavPages: NavPage[] = [
  {
    href: '',
    name: 'Overview',
    component: withWizardVMContext(WizardOverviewTab),
  },
  {
    href: 'yaml',
    name: 'YAML',
    component: withWizardVMContext(WizardYAMLTab),
  },
  {
    href: 'scheduling',
    name: 'Scheduling',
    component: withWizardVMContext(WizardSchedulingTab),
  },
  {
    href: 'environment',
    name: 'Environment',
    component: withWizardVMContext(WizardEnvironmentTab),
  },
  {
    href: 'network-interfaces',
    name: 'Network Interfaces',
    component: withWizardVMContext(WizardNetworkTab),
  },
  {
    href: 'disks',
    name: 'Disks',
    component: withWizardVMContext(WizardDisksTab),
  },
  {
    href: 'scripts',
    name: 'Scripts',
    component: withWizardVMContext(WizardScriptsTab),
  },
  {
    href: 'metadata',
    name: 'Metadata',
    component: withWizardVMContext(WizardMetadataTab),
  },
];
