import { TFunction } from 'i18next';

import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import CustomizeInstanceTypeDetailsTab from '@virtualmachines/creation-wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeDetailsTab';
import CustomizeInstanceTypeInitialRunTab from '@virtualmachines/creation-wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeInitialRunTab';
import CustomizeInstanceTypeMetadataTab from '@virtualmachines/creation-wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeMetadataTab';
import CustomizeInstanceTypeNetworkTab from '@virtualmachines/creation-wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeNetworkTab';
import CustomizeInstanceTypeSchedulingTab from '@virtualmachines/creation-wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeSchedulingTab';
import CustomizeInstanceTypeSSHTab from '@virtualmachines/creation-wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeSSHTab';
import CustomizeInstanceTypeStorageTab from '@virtualmachines/creation-wizard/steps/CustomizationStep/components/CustomizeVirtualMachine/components/CustomizeVMTabs/tabs/CustomizeInstanceTypeStorageTab';
import { getTabNameAndTitle } from '@virtualmachines/details/utils/utils';

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
