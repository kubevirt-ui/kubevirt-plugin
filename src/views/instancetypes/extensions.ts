import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { ResourceListPage, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  InstanceTypePage: './views/instancetypes/list/InstanceTypePage.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: { $codeRef: 'InstanceTypePage' },
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineClusterInstancetype',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,
  {
    properties: {
      component: {
        $codeRef: 'InstanceTypePage',
      },
      exact: true,
      path: [
        '/k8s/ns/:ns/instancetype.kubevirt.io~v1beta1~VirtualMachineInstancetype',
        '/k8s/all-namespaces/instancetype.kubevirt.io~v1beta1~VirtualMachineInstancetype',
      ],
      prefixNamespaced: true,
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
