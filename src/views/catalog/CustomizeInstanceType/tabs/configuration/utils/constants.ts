import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';

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
    name: VirtualMachineDetailsTab.Details,
    title: VirtualMachineDetailsTabLabel.Details,
  },
  {
    Component: CustomizeInstanceTypeStorageTab,
    name: VirtualMachineDetailsTab.Storage,
    title: VirtualMachineDetailsTabLabel.Storage,
  },
  {
    Component: CustomizeInstanceTypeNetworkTab,
    name: VirtualMachineDetailsTab.Network,
    title: VirtualMachineDetailsTabLabel.Network,
  },
  {
    Component: CustomizeInstanceTypeSchedulingTab,
    name: VirtualMachineDetailsTab.Scheduling,
    title: VirtualMachineDetailsTabLabel.Scheduling,
  },
  {
    Component: CustomizeInstanceTypeSSHTab,
    name: VirtualMachineDetailsTab.SSH,
    title: VirtualMachineDetailsTabLabel.SSH,
  },
  {
    Component: CustomizeInstanceTypeInitialRunTab,
    name: VirtualMachineDetailsTab['Initial-run'],
    title: VirtualMachineDetailsTabLabel['Initial-run'],
  },
  {
    Component: CustomizeInstanceTypeMetadataTab,
    name: VirtualMachineDetailsTab.Metadata,
    title: VirtualMachineDetailsTabLabel.Metadata,
  },
];
