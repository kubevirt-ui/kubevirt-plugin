import type { ResourceDetailsPage, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  TemplateNavPage: './views/templates/details/TemplateNavPage.tsx',
  VirtualMachineTemplatesList: './views/templates/list/VirtualMachineTemplatesList.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: { $codeRef: 'VirtualMachineTemplatesList' },
      exact: true,
      path: ['/k8s/ns/:ns/templates', '/k8s/all-namespaces/templates'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: { $codeRef: 'TemplateNavPage' },
      model: {
        group: 'template.openshift.io',
        kind: 'Template',
        version: 'v1',
      },
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,
  {
    properties: {
      component: { $codeRef: 'TemplateNavPage' },
      model: {
        group: 'template.kubevirt.io',
        kind: 'VirtualMachineTemplate',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,
  {
    properties: {
      component: { $codeRef: 'TemplateNavPage' },
      model: {
        group: 'template.kubevirt.io',
        kind: 'VirtualMachineTemplate',
        version: 'v1alpha1',
      },
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,
];
