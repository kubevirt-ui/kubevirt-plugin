import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  DashboardsInventoryItemGroup,
  DashboardsOverviewInventoryItem,
  DashboardsOverviewResourceActivity,
  DashboardsProjectOverviewInventoryItem,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  dashboardActivity: 'src/views/dashboard-extensions/Activity.tsx',
  dashboardActivityUtils: 'src/views/dashboard-extensions/utils.ts',
  dashboardInventory: 'src/views/dashboard-extensions/Inventory.tsx',
  dashboardStatus: 'src/views/dashboard-extensions/KubevirtHealthPopup/KubevirtHealthPopup.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      mapper: { $codeRef: 'dashboardInventory.getVMStatusGroups' },
      model: { $codeRef: 'dashboardActivityUtils.VirtualMachineModel' },
    },
    type: 'console.dashboards/overview/inventory/item',
  } as EncodedExtension<DashboardsOverviewInventoryItem>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      mapper: { $codeRef: 'dashboardInventory.getVMStatusGroups' },
      model: { $codeRef: 'dashboardActivityUtils.VirtualMachineModel' },
    },
    type: 'console.dashboards/project/overview/item',
  } as EncodedExtension<DashboardsProjectOverviewInventoryItem>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      icon: { $codeRef: 'dashboardInventory.VMOffGroupIcon' },
      id: 'vm-stopped',
    },
    type: 'console.dashboards/overview/inventory/item/group',
  } as EncodedExtension<DashboardsInventoryItemGroup>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      component: { $codeRef: 'dashboardActivity.DiskImportActivity' },
      getTimestamp: { $codeRef: 'dashboardActivityUtils.getTimestamp' },
      isActivity: { $codeRef: 'dashboardActivityUtils.isDVActivity' },
      k8sResource: {
        $codeRef: 'dashboardActivityUtils.k8sDVResource',
      },
    },
    type: 'console.dashboards/overview/activity/resource',
  } as EncodedExtension<DashboardsOverviewResourceActivity>,
];
