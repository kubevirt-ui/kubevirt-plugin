import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  topology: 'src/views/topology/utils/kubevirtComponentFactory.ts',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT'],
    },
    properties: {
      getFactory: {
        $codeRef: 'topology.getKubevirtComponentFactory',
      },
    },
    type: 'console.topology/component/factory',
  },
];
