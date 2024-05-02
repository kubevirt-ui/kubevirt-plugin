import { Fragment } from 'react';

import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';

import CustomizeInstanceTypeDetailsTab from './tabs/CustomizeInstanceTypeDetailsTab';
import CustomizeInstanceTypeStorageTab from './tabs/CustomizeInstanceTypeStorageTab';

export const tabs = [
  {
    Component: CustomizeInstanceTypeDetailsTab,
    name: VirtualMachineDetailsTab.Details,
    title: VirtualMachineDetailsTabLabel.Details,
  },
  {
    Component: CustomizeInstanceTypeStorageTab,
    name: VirtualMachineDetailsTab.Storage,
    title: VirtualMachineDetailsTabLabel.Storage,
  },
  {
    Component: Fragment,
    name: VirtualMachineDetailsTab.Network,
    title: VirtualMachineDetailsTabLabel.Network,
  },
  {
    Component: Fragment,
    name: VirtualMachineDetailsTab.Scheduling,
    title: VirtualMachineDetailsTabLabel.Scheduling,
  },
  {
    Component: Fragment,
    name: VirtualMachineDetailsTab.SSH,
    title: VirtualMachineDetailsTabLabel.SSH,
  },
  {
    Component: Fragment,
    name: VirtualMachineDetailsTab['Initial-run'],
    title: VirtualMachineDetailsTabLabel['Initial-run'],
  },
  {
    Component: Fragment,
    name: VirtualMachineDetailsTab.Metadata,
    title: VirtualMachineDetailsTabLabel.Metadata,
  },
];
