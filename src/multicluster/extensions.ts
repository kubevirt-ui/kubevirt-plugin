import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { StandaloneRoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';
import { ResourceDetails } from '@stolostron/multicluster-sdk';

//import { FLEET_STANDALONE_CONSOLE_PATH } from '../utils/components/Consoles/FleetConsoleStandAlone';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  FleetConsoleStandAlone: './utils/components/Consoles/FleetConsoleStandAlone.tsx',
  FleetVirtualMachineNavPage: './views/virtualmachines/details/FleetVirtualMachineNavPage.tsx',
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
  {
    properties: {
      component: { $codeRef: 'FleetVirtualMachineNavPage' },
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
      component: { $codeRef: 'FleetConsoleStandAlone' },
      exact: false,
      path: ['/multicloud/infrastructure/vmconsole/:cluster/:namespace/:name'],
    },
    type: 'console.page/route/standalone',
  } as EncodedExtension<StandaloneRoutePage>,
];
