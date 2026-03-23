import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  ClusterOverviewPage: './views/clusteroverview/ClusterOverviewPage.tsx',
  VirtualizationLandingPage: 'src/perspective/VirtualizationLandingPage.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: {
        $codeRef: 'ClusterOverviewPage',
      },
      path: ['/k8s/ns/:ns/virtualization-overview', '/k8s/all-namespaces/virtualization-overview'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'VirtualizationLandingPage',
      },
      path: ['/k8s/virtualization-landing'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
