import { Fragment } from 'react';

import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';

export const tabs = [
  {
    Component: Fragment,
    name: VirtualMachineDetailsTab.Details,
    title: VirtualMachineDetailsTabLabel.Details,
  },
  {
    Component: Fragment,
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
