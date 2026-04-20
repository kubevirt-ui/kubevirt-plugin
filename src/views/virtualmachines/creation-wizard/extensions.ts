import type {
  EncodedExtension,
  ConsolePluginBuildMetadata,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  VMWizard: './views/virtualmachines/creation-wizard/VMCreationWizard.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    prefixNamespaced: true,
    properties: {
      component: {
        $codeRef: 'VMWizard',
      },
      path: ['/vm-wizard'],
    },
    type: 'console.page/route',
  } as EncodedExtension,
];
