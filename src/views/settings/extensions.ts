import type { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  SettingsPage: './views/settings/SettingsPage.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: {
        $codeRef: 'SettingsPage',
      },
      path: [
        '/k8s/ns/:ns/virtualization-settings',
        '/k8s/ns/:ns/virtualization-settings/*',
        '/k8s/all-namespaces/virtualization-settings',
        '/k8s/all-namespaces/virtualization-settings/*',
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
