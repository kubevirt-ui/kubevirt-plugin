import type { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type {
  EncodedExtension,
  ConsolePluginBuildMetadata,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  Catalog: './views/catalog/Catalog.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: {
        $codeRef: 'Catalog',
      },
      path: ['/k8s/ns/:ns/catalog', '/k8s/all-namespaces/catalog'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
