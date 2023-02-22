import { VirtualMachineDetailsTabLabel } from '@kubevirt-utils/components/PendingChanges/utils/constants';

import DiskListPage from '../disk/DiskListPage';
import VirtualMachineEnvironmentPage from '../environment/VirtualMachineEnvironmentPage';
import NetworkInterfaceListPage from '../network/NetworkInterfaceListPage';
import VirtualMachineSchedulingPage from '../scheduling/VirtualMachineSchedulingPage';
import ScriptsTab from '../scripts/ScriptsTab';

export const tabs = [
  { title: VirtualMachineDetailsTabLabel.Scheduling, Component: VirtualMachineSchedulingPage },
  { title: VirtualMachineDetailsTabLabel.Environment, Component: VirtualMachineEnvironmentPage },
  { title: VirtualMachineDetailsTabLabel.NetworkInterfaces, Component: NetworkInterfaceListPage },
  { title: VirtualMachineDetailsTabLabel.Disks, Component: DiskListPage },
  { title: VirtualMachineDetailsTabLabel.Scripts, Component: ScriptsTab },
];
