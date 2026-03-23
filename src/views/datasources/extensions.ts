import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { ResourceDetailsPage, ResourceListPage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  DataImportCronPage: './views/datasources/dataimportcron/details/DataImportCronPage.tsx',
  DataSourcePage: './views/datasources/details/DataSourcePage.tsx',
  DataSourcesList: './views/datasources/list/DataSourcesList.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: { $codeRef: 'DataSourcePage' },
      model: {
        group: 'cdi.kubevirt.io',
        kind: 'DataSource',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,
  {
    properties: {
      component: { $codeRef: 'DataSourcesList' },
      model: {
        group: 'cdi.kubevirt.io',
        kind: 'DataSource',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,
  {
    properties: {
      component: { $codeRef: 'DataImportCronPage' },
      model: {
        group: 'cdi.kubevirt.io',
        kind: 'DataImportCron',
        version: 'v1beta1',
      },
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,
];
