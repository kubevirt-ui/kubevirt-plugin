import type { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

import { VM_NETWORKS_OTHER_TYPES_PATH, VM_NETWORKS_PATH } from './constants';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  VMNetworkDetailsPage: './views/vmnetworks/details/VMNetworkDetailsPage.tsx',
  VMNetworkNewForm: './views/vmnetworks/form/VMNetworkNewForm.tsx',
  VMNetworksPage: './views/vmnetworks/list/VMNetworksPage.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: {
        $codeRef: 'VMNetworksPage',
      },
      path: [VM_NETWORKS_PATH, VM_NETWORKS_OTHER_TYPES_PATH],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'VMNetworkDetailsPage',
      },
      path: [`${VM_NETWORKS_PATH}/:name`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'VMNetworkNewForm',
      },
      path: [`${VM_NETWORKS_PATH}/~new`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
