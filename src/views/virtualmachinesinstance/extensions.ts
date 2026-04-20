import type {
  ResourceActionProvider,
  ResourceDetailsPage,
  ResourceListPage,
} from '@openshift-console/dynamic-plugin-sdk';
import type {
  EncodedExtension,
  ConsolePluginBuildMetadata,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  useVirtualMachineInstanceActionsProvider:
    './views/virtualmachinesinstance/actions/hooks/useVirtualMachineInstanceActionsProvider.tsx',
  VirtualMachinesInstancePage:
    './views/virtualmachinesinstance/details/VirtualMachinesInstancePage.tsx',
  VirtualMachinesInstancesList:
    './views/virtualmachinesinstance/list/VirtualMachinesInstancesList.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: { $codeRef: 'VirtualMachinesInstancesList' },
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachineInstance',
        version: 'v1',
      },
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,
  {
    properties: {
      component: { $codeRef: 'VirtualMachinesInstancePage' },
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachineInstance',
        version: 'v1',
      },
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,
  {
    properties: {
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachineInstance',
        version: 'v1',
      },
      provider: {
        $codeRef: 'useVirtualMachineInstanceActionsProvider',
      },
    },
    type: 'console.action/resource-provider',
  } as EncodedExtension<ResourceActionProvider>,
];
