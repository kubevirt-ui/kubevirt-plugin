import type { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type {
  EncodedExtension,
  ConsolePluginBuildMetadata,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  BootableVolumesList: './views/bootablevolumes/list/BootableVolumesList.tsx',
  BootableVolumeYAMLPage: './views/bootablevolumes/list/components/BootableVolumeYAMLPage.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: {
        $codeRef: 'BootableVolumeYAMLPage',
      },
      path: ['/k8s/ns/:ns/bootablevolumes/~new'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'BootableVolumesList',
      },
      path: ['/k8s/ns/:ns/bootablevolumes', '/k8s/all-namespaces/bootablevolumes'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
