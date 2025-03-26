import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  topology: 'src/views/topology/topology-plugin.ts',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      getFactory: {
        $codeRef: 'topology.kubevirtComponentFactory',
      },
    },
    type: 'console.topology/component/factory',
  },
];
