import type { ResourceDetailsPage, ResourceListPage } from '@openshift-console/dynamic-plugin-sdk';
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
];
