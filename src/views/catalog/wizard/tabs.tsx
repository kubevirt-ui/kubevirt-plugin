import * as React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { NavPage } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import { useWizardVMContext, WizardVMContextType } from '../utils/WizardVMContext';

import WizardDisksTab from './tabs/disks/WizardDisksTab';
import WizardEnvironmentTab from './tabs/environment/WizardEnvironmentTab';
import WizardMetadataTab from './tabs/metadata/WizardMetadataTab';
import WizardNetworkTab from './tabs/network/WizardNetworkTab';
import WizardOverviewTab from './tabs/overview/WizardOverviewTab';
import WizardSchedulingTab from './tabs/scheduling/WizardSchedulingTab';
import WizardScriptsTab from './tabs/scripts/WizardScriptsTab';
import WizardYAMLTab from './tabs/yaml/WizardYAMLTab';

const withVmContext = (Page: React.FC<WizardVMContextType>) => (props) => {
  const { vm, updateVM, loaded, error, disableVmCreate, setDisableVmCreate } = useWizardVMContext();

  if (!vm && !loaded) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  return (
    <Page
      vm={vm}
      loaded={loaded}
      updateVM={updateVM}
      error={error}
      disableVmCreate={disableVmCreate}
      setDisableVmCreate={setDisableVmCreate}
      {...props}
    />
  );
};

export const wizardNavPages: NavPage[] = [
  {
    href: '',
    name: 'Overview',
    component: withVmContext(WizardOverviewTab),
  },
  {
    href: 'yaml',
    name: 'YAML',
    component: withVmContext(WizardYAMLTab),
  },
  {
    href: 'scheduling',
    name: 'Scheduling',
    component: withVmContext(WizardSchedulingTab),
  },
  {
    href: 'enviornment',
    name: 'Enviornment',
    component: withVmContext(WizardEnvironmentTab),
  },
  {
    href: 'network-interfaces',
    name: 'Network Interfaces',
    component: withVmContext(WizardNetworkTab),
  },
  {
    href: 'disks',
    name: 'Disks',
    component: withVmContext(WizardDisksTab),
  },
  {
    href: 'scripts',
    name: 'Scripts',
    component: withVmContext(WizardScriptsTab),
  },
  {
    href: 'metadata',
    name: 'Metadata',
    component: withVmContext(WizardMetadataTab),
  },
];
