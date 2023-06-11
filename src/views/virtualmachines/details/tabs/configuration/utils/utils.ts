import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';
import { NETWORK } from '@virtualmachines/utils';

import DiskListPage from '../disk/DiskListPage';
import VirtualMachineEnvironmentPage from '../environment/VirtualMachineEnvironmentPage';
import NetworkInterfaceListPage from '../network/NetworkInterfaceListPage';
import VirtualMachineSchedulingPage from '../scheduling/VirtualMachineSchedulingPage';
import ScriptsTab from '../scripts/ScriptsTab';

export const tabs = [
  {
    Component: VirtualMachineSchedulingPage,
    name: VirtualMachineDetailsTab.Scheduling,
    title: VirtualMachineDetailsTabLabel.Scheduling,
  },
  {
    Component: VirtualMachineEnvironmentPage,
    name: VirtualMachineDetailsTab.Environment,
    title: VirtualMachineDetailsTabLabel.Environment,
  },
  {
    Component: NetworkInterfaceListPage,
    name: NETWORK,
    title: VirtualMachineDetailsTabLabel.NetworkInterfaces,
  },
  {
    Component: DiskListPage,
    name: VirtualMachineDetailsTab.Disks,
    title: VirtualMachineDetailsTabLabel.Disks,
  },
  {
    Component: ScriptsTab,
    name: VirtualMachineDetailsTab.Scripts,
    title: VirtualMachineDetailsTabLabel.Scripts,
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
