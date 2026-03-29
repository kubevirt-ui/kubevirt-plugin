import { TFunction } from 'react-i18next';

import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { getTabNameAndTitle } from '@virtualmachines/details/utils/utils';

import CustomizeInstanceTypeDetailsTab from './tabs/CustomizeInstanceTypeDetailsTab';
import CustomizeInstanceTypeInitialRunTab from './tabs/CustomizeInstanceTypeInitialRunTab';
import CustomizeInstanceTypeMetadataTab from './tabs/CustomizeInstanceTypeMetadataTab';
import CustomizeInstanceTypeNetworkTab from './tabs/CustomizeInstanceTypeNetworkTab';
import CustomizeInstanceTypeSchedulingTab from './tabs/CustomizeInstanceTypeSchedulingTab';
import CustomizeInstanceTypeSSHTab from './tabs/CustomizeInstanceTypeSSHTab';
import CustomizeInstanceTypeStorageTab from './tabs/CustomizeInstanceTypeStorageTab';

export const getTabs = (t: TFunction) => [
  {
    Component: CustomizeInstanceTypeDetailsTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Details, t),
  },
  {
    Component: CustomizeInstanceTypeStorageTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Storage, t),
  },
  {
    Component: CustomizeInstanceTypeNetworkTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Network, t),
  },
  {
    Component: CustomizeInstanceTypeSchedulingTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Scheduling, t),
  },
  {
    Component: CustomizeInstanceTypeSSHTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.SSH, t),
  },
  {
    Component: CustomizeInstanceTypeInitialRunTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.InitialRun, t),
  },
  {
    Component: CustomizeInstanceTypeMetadataTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Metadata, t),
  },
];
