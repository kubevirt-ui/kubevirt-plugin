import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  ResourceActionProvider,
  ResourceNSNavItem,
  RoutePage,
  StandaloneRoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  LogsStandAlone:
    './views/virtualmachines/details/tabs/diagnostic/VirtualMachineLogViewer/VirtualMachineLogViewerStandAlone/VirtualMachineLogViewerStandAlone.tsx',
  Navigator: './views/virtualmachines/navigator/VirtualMachineNavigator.tsx',
  useServiceActionsProvider: './utils/components/ServicesList/useServiceActionsProvider.ts',
  VirtualMachineSearchResults: './views/virtualmachines/search/VirtualMachineSearchResults.tsx',
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
    properties: {
      component: { $codeRef: 'VirtualMachineSearchResults' },
      path: ['/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine/search'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,

  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualmachines',
        'data-test-id': 'virtualmachines-nav-item',
      },
      id: 'virtualmachines',
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~VirtualMachines%',
      section: 'virtualization',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
];
