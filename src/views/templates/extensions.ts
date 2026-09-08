import type {
  ResourceDetailsPage,
  ResourceListPage,
  RoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  TemplateNavPage: './views/templates/details/TemplateNavPage.tsx',
  TemplateYAMLCreatePage: './views/templates/list/components/TemplateYAMLCreatePage.tsx',
  VirtualMachineTemplatesList: './views/templates/list/VirtualMachineTemplatesList.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: { $codeRef: 'TemplateYAMLCreatePage' },
      path: ['/k8s/ns/:ns/templates/~new'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: { $codeRef: 'VirtualMachineTemplatesList' },
      model: {
        group: 'template.openshift.io',
        kind: 'Template',
        version: 'v1',
      },
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,
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
