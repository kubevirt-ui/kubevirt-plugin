import type { ResourceDetailsPage, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

import {
  VM_TEMPLATES_ALL_NAMESPACES_PATH,
  VM_TEMPLATES_DETAILS_PATH,
  VM_TEMPLATES_NEW_PATH,
  VM_TEMPLATES_NS_PATH,
} from './constants';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  TemplateNavPage: './views/templates/details/TemplateNavPage.tsx',
  VirtualMachineTemplatesList: './views/templates/list/VirtualMachineTemplatesList.tsx',
  VirtualMachineTemplateYAMLPage:
    './views/templates/list/components/VirtualMachineTemplateYAMLPage.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: { $codeRef: 'VirtualMachineTemplatesList' },
      exact: true,
      path: [VM_TEMPLATES_NS_PATH, VM_TEMPLATES_ALL_NAMESPACES_PATH],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: { $codeRef: 'VirtualMachineTemplateYAMLPage' },
      exact: true,
      path: [VM_TEMPLATES_NEW_PATH],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: { $codeRef: 'TemplateNavPage' },
      // no `exact`, the details page owns its tab sub-paths i.e. /yaml, /disks etc.
      path: [VM_TEMPLATES_DETAILS_PATH],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
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
