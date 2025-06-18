import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { StandaloneRoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

//import { FLEET_STANDALONE_CONSOLE_PATH } from '../utils/components/Consoles/FleetConsoleStandAlone';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  ConsoleStandAlone: './utils/components/Consoles/ConsoleStandAlone.tsx',
  Navigator: './views/virtualmachines/navigator/VirtualMachineNavigator.tsx',
};

export const extensions: EncodedExtension[] = [
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

  {
    properties: {
      component: {
        $codeRef: 'Navigator',
      },
      path: [
        '/multicloud/infrastructure/virtualmachines/:cluster/:ns/:name',
        '/multicloud/infrastructure/virtualmachines/:cluster/:ns',
        '/multicloud/infrastructure/virtualmachines/:cluster',
        '/multicloud/infrastructure/virtualmachines',
      ],
    },
    type: 'console.page/route',
  },
];
