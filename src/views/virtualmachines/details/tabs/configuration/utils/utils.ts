import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/components/PendingChanges/utils/constants';
import { NETWORK } from '@virtualmachines/utils';

import DiskListPage from '../disk/DiskListPage';
import VirtualMachineEnvironmentPage from '../environment/VirtualMachineEnvironmentPage';
import NetworkInterfaceListPage from '../network/NetworkInterfaceListPage';
import VirtualMachineSchedulingPage from '../scheduling/VirtualMachineSchedulingPage';
import ScriptsTab from '../scripts/ScriptsTab';

export const tabs = [
  {
    title: VirtualMachineDetailsTabLabel.Scheduling,
    Component: VirtualMachineSchedulingPage,
    name: VirtualMachineDetailsTab.Scheduling,
  },
  {
    title: VirtualMachineDetailsTabLabel.Environment,
    Component: VirtualMachineEnvironmentPage,
    name: VirtualMachineDetailsTab.Environment,
  },
  {
    title: VirtualMachineDetailsTabLabel.NetworkInterfaces,
    Component: NetworkInterfaceListPage,
    name: NETWORK,
  },
  {
    title: VirtualMachineDetailsTabLabel.Disks,
    Component: DiskListPage,
    name: VirtualMachineDetailsTab.Disks,
  },
  {
    title: VirtualMachineDetailsTabLabel.Scripts,
    Component: ScriptsTab,
    name: VirtualMachineDetailsTab.Scripts,
  },
];

export const innerTabs: { [key: string]: string } = tabs.reduce((acc, { name }) => {
  acc[name] = name;
  return acc;
}, {});

export const getInnerTabFromPath = (path: string) =>
  innerTabs[path.slice(path.lastIndexOf('/') + 1)];

export const includesConfigurationPath = (path: string): boolean =>
  path.includes(`${VirtualMachineDetailsTab.Configurations}/`);
