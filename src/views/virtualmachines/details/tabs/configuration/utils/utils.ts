import { TFunction } from 'react-i18next';

import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { getTabNameAndTitle } from '@virtualmachines/details/utils/utils';

import DetailsTab from '../details/DetailsTab';
import InitialRunTab from '../initialrun/InitialRunTab';
import MetadataTab from '../metadata/MetadataTab';
import NetworkInterfaceListPage from '../network/NetworkTab';
import VirtualMachineSchedulingPage from '../scheduling/SchedulingTab';
import SSHTab from '../ssh/SSHTab';
import StorageTab from '../storage/StorageTab';

export const getTabs = (t: TFunction) => [
  {
    Component: DetailsTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Details, t),
  },
  {
    Component: StorageTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Storage, t),
  },
  {
    Component: NetworkInterfaceListPage,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Network, t),
  },
  {
    Component: VirtualMachineSchedulingPage,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Scheduling, t),
  },
  {
    Component: SSHTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.SSH, t),
  },
  {
    Component: InitialRunTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.InitialRun, t),
  },
  {
    Component: MetadataTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Metadata, t),
  },
];

const getInnerTabs = (t: TFunction): { [key: string]: string } =>
  getTabs(t).reduce((acc, { name }) => {
    acc[name] = name;
    return acc;
  }, {});

export const getInnerTabFromPath = (path: string, t: TFunction) =>
  getInnerTabs(t)[path.slice(path.lastIndexOf('/') + 1)];

export const includesConfigurationPath = (path: string, append: string): string => {
  const index = path.lastIndexOf(`${VirtualMachineDetailsTab.Configurations}`);
  const substr = path.slice(0, index);
  return substr + append;
};
