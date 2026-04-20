import type { ResourceActionProvider } from '@openshift-console/dynamic-plugin-sdk';
import type {
  EncodedExtension,
  ConsolePluginBuildMetadata,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  useStorageClassActionsProvider:
    './views/storageclasses/actions/hooks/useStorageClassActionsProvider.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      model: {
        group: 'storage.k8s.io',
        kind: 'StorageClass',
        version: 'v1',
      },
      provider: {
        $codeRef: 'useStorageClassActionsProvider',
      },
    },
    type: 'console.action/resource-provider',
  } as EncodedExtension<ResourceActionProvider>,
];
