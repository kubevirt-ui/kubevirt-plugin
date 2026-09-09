import type { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  MigrationsPage: './views/migrations/MigrationsPage.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: {
        $codeRef: 'MigrationsPage',
      },
      path: [
        '/k8s/ns/:ns/virtualization-migrations',
        '/k8s/all-namespaces/virtualization-migrations',
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
