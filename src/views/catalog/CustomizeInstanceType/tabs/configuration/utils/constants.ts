import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { getTabNameAndTitle } from '@virtualmachines/details/utils/utils';

import CustomizeInstanceTypeDetailsTab from './tabs/CustomizeInstanceTypeDetailsTab';
import CustomizeInstanceTypeInitialRunTab from './tabs/CustomizeInstanceTypeInitialRunTab';
import CustomizeInstanceTypeMetadataTab from './tabs/CustomizeInstanceTypeMetadataTab';
import CustomizeInstanceTypeNetworkTab from './tabs/CustomizeInstanceTypeNetworkTab';
import CustomizeInstanceTypeSchedulingTab from './tabs/CustomizeInstanceTypeSchedulingTab';
import CustomizeInstanceTypeSSHTab from './tabs/CustomizeInstanceTypeSSHTab';
import CustomizeInstanceTypeStorageTab from './tabs/CustomizeInstanceTypeStorageTab';

export const tabs = [
  {
    Component: CustomizeInstanceTypeDetailsTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Details),
  },
  {
    Component: CustomizeInstanceTypeStorageTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Storage),
  },
  {
    Component: CustomizeInstanceTypeNetworkTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Network),
  },
  {
    Component: CustomizeInstanceTypeSchedulingTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Scheduling),
  },
  {
    Component: CustomizeInstanceTypeSSHTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.SSH),
  },
  {
    Component: CustomizeInstanceTypeInitialRunTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.InitialRun),
  },
  {
    Component: CustomizeInstanceTypeMetadataTab,
    ...getTabNameAndTitle(VirtualMachineDetailsTab.Metadata),
  },
];
