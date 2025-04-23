import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { HrefNavItem, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  StorageMigrationList: './views/storagemigrations/list/StorageMigrationList.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['STORAGE_MIGRATION_ENABLED'],
    },
    properties: {
      component: { $codeRef: 'StorageMigrationList' },
      path: ['/k8s/storagemigrations'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['STORAGE_MIGRATION_ENABLED'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-storagemigrations',
        'data-test-id': 'storagemigrations-nav-item',
      },
      href: '/k8s/storagemigrations',
      id: 'storagemigrations',
      name: '%plugin__kubevirt-plugin~Storage MigrationPlans%',
      prefixNamespaced: false,
      section: 'migration',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];
