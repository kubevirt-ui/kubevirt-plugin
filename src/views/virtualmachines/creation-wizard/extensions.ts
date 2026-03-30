import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  VMWizard: './views/virtualmachines/creation-wizard/VMCreationWizard.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: {
        $codeRef: 'VMWizard',
      },
      path: ['/k8s/ns/:ns/vmwizard', '/k8s/all-namespaces/vmwizard'],
    },
    type: 'console.page/route',
  } as EncodedExtension,
];
