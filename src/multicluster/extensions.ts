import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { StandaloneRoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';
import { ResourceDetails } from '@stolostron/multicluster-sdk';

//import { FLEET_STANDALONE_CONSOLE_PATH } from '../utils/components/Consoles/FleetConsoleStandAlone';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  ConsoleStandAlone: './utils/components/Consoles/ConsoleStandAlone.tsx',
  VirtualMachineNavPage: './views/virtualmachines/details/VirtualMachineNavPage.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: { $codeRef: 'VirtualMachineNavPage' },
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
    },
    type: 'acm.resource/details',
  } as EncodedExtension<ResourceDetails>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      component: { $codeRef: 'ConsoleStandAlone' },
      exact: false,
      path: ['/multicloud/infrastructure/vmconsole/:cluster/:namespace/:name'],
    },
    type: 'console.page/route/standalone',
  } as EncodedExtension<StandaloneRoutePage>,
];
