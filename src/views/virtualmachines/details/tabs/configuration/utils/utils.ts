import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';

import DetailsTab from '../details/DetailsTab';
import InitialRunTab from '../initialrun/InitialRunTab';
import MetadataTab from '../metadata/MetadataTab';
import NetworkInterfaceListPage from '../network/NetworkTab';
import VirtualMachineSchedulingPage from '../scheduling/SchedulingTab';
import SSHTab from '../ssh/SSHTab';
import StorageTab from '../storage/StorageTab';

export const tabs = [
  {
    Component: DetailsTab,
    name: VirtualMachineDetailsTab.Details,
    title: VirtualMachineDetailsTabLabel.Details,
  },
  {
    Component: StorageTab,
    name: VirtualMachineDetailsTab.Storage,
    title: VirtualMachineDetailsTabLabel.Storage,
  },
  {
    Component: NetworkInterfaceListPage,
    name: VirtualMachineDetailsTab.Network,
    title: VirtualMachineDetailsTabLabel.Network,
  },
  {
    Component: VirtualMachineSchedulingPage,
    name: VirtualMachineDetailsTab.Scheduling,
    title: VirtualMachineDetailsTabLabel.Scheduling,
  },
  {
    Component: SSHTab,
    name: VirtualMachineDetailsTab.SSH,
    title: VirtualMachineDetailsTabLabel.SSH,
  },
  {
    Component: InitialRunTab,
    name: VirtualMachineDetailsTab['Initial-run'],
    title: VirtualMachineDetailsTabLabel['Initial-run'],
  },
  {
    Component: MetadataTab,
    name: VirtualMachineDetailsTab.Metadata,
    title: VirtualMachineDetailsTabLabel.Metadata,
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
