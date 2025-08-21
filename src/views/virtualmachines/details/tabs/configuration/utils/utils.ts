import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { getTabNameAndTitle } from '@virtualmachines/details/utils/utils';

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
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Details),
  },
  {
    Component: StorageTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Storage),
  },
  {
    Component: NetworkInterfaceListPage,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Network),
  },
  {
    Component: VirtualMachineSchedulingPage,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Scheduling),
  },
  {
    Component: SSHTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.SSH),
  },
  {
    Component: InitialRunTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.InitialRun),
  },
  {
    Component: MetadataTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Metadata),
  },
];

export const innerTabs: { [key: string]: string } = tabs.reduce((acc, { name }) => {
  acc[name] = name;
  return acc;
}, {});

export const getInnerTabFromPath = (path: string) =>
  innerTabs[path.slice(path.lastIndexOf('/') + 1)];

export const includesConfigurationPath = (path: string, append: string): string => {
  const index = path.lastIndexOf(`${VirtualMachineDetailsTab.Configurations}`);
  const substr = path.slice(0, index);
  return substr + append;
};
