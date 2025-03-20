import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';
import { ResourceDetails } from '@stolostron/multicluster-sdk';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  FleetVirtualMachinesOverviewTab:
    './views/virtualmachines/details/tabs/overview/FleetVirtualMachinesOverviewTab.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: { $codeRef: 'FleetVirtualMachinesOverviewTab' },
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
    },
    type: 'acm.resource/details',
  } as EncodedExtension<ResourceDetails>,
];
