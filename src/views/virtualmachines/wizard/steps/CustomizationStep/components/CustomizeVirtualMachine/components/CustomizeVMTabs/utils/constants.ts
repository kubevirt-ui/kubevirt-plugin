import { TFunction } from 'i18next';
import { FC } from 'react';

import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import CustomizeInstanceTypeDetailsTab from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeDetailsTab';
import CustomizeInstanceTypeInitialRunTab from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeInitialRunTab';
import CustomizeInstanceTypeMetadataTab from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeMetadataTab';
import CustomizeInstanceTypeNetworkTab from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeNetworkTab';
import CustomizeInstanceTypeSchedulingTab from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeSchedulingTab';
import CustomizeInstanceTypeSSHTab from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeSSHTab';
import CustomizeInstanceTypeStorageTab from '@virtualmachines/wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeStorageTab';
import { getTabNameAndTitle } from '@virtualmachines/details/utils/utils';

export type TabConfig = {
  Component: FC;
  name: string;
  title: string;
};

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
