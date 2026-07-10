import type {
  ResourceActionProvider,
  RoutePage,
  StandaloneRoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  LogsStandAlone:
    './views/virtualmachines/details/tabs/diagnostic/VirtualMachineLogViewer/VirtualMachineLogViewerStandAlone/VirtualMachineLogViewerStandAlone.tsx',
  Navigator: './views/virtualmachines/navigator/VirtualMachineNavigator.tsx',
  NodeInventoryItem: './views/virtualmachines/node/inventoryitem/NodeInventoryItem.tsx',
  NodeVirtualMachineList: './views/virtualmachines/node/list/NodeVirtualMachinesList.tsx',
  useServiceActionsProvider: './utils/components/ServicesList/useServiceActionsProvider.ts',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      component: { $codeRef: 'LogsStandAlone' },
      exact: false,
      path: ['/k8s/ns/:ns/kubevirt.io~v1~VirtualMachine/:name/diagnostics/logs/standalone'],
    },
    type: 'console.page/route/standalone',
  } as EncodedExtension<StandaloneRoutePage>,

  {
    properties: {
      model: {
        group: 'core',
        kind: 'Service',
        version: 'v1',
      },
      provider: {
        $codeRef: 'useServiceActionsProvider',
      },
    },
    type: 'console.action/resource-provider',
  } as EncodedExtension<ResourceActionProvider>,

  {
    properties: {
      component: { $codeRef: 'Navigator' },
      path: [
        '/k8s/ns/:ns/kubevirt.io~v1~VirtualMachine/:name',
        '/k8s/ns/:ns/kubevirt.io~v1~VirtualMachine',
        '/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine',
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,

  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      component: { $codeRef: 'NodeVirtualMachineList' },
      page: {
        name: '%plugin__kubevirt-plugin~Virtual machines%',
        priority: 90,
        tabId: 'virtualmachines',
      },
      parentTab: 'workload',
    },
    type: 'console.node/sub-nav-tab',
  } as EncodedExtension,

  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      component: { $codeRef: 'NodeInventoryItem' },
      priority: 30,
    },
    type: 'console.node/inventory-item',
  } as EncodedExtension,
];
