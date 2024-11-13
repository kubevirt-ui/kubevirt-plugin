import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  ResourceActionProvider,
  ResourceDetailsPage,
  ResourceListPage,
  StandaloneRoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  LogsStandAlone:
    './views/virtualmachines/details/tabs/diagnostic/VirtualMachineLogViewer/VirtualMachineLogViewerStandAlone/VirtualMachineLogViewerStandAlone.tsx',
  useVirtualMachineActionsProvider:
    './views/virtualmachines/actions/hooks/useVirtualMachineActionsProvider.ts',
  VirtualMachineNavPage: './views/virtualmachines/details/VirtualMachineNavPage.tsx',
  VirtualMachinesList: './views/virtualmachines/list/VirtualMachinesList.tsx',
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
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
      provider: {
        $codeRef: 'useVirtualMachineActionsProvider',
      },
    },
    type: 'console.action/resource-provider',
  } as EncodedExtension<ResourceActionProvider>,

  {
    properties: {
      component: { $codeRef: 'VirtualMachineNavPage' },
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,
  {
    properties: {
      component: {
        $codeRef: 'VirtualMachinesList',
      },
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,
];
