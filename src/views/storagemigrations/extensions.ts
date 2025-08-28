import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  FeatureFlagHookProvider,
  NavSection,
  ResourceActionProvider,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  StorageMigrationList: './views/storagemigrations/list/StorageMigrationList.tsx',
  useStorageMigrationActions: './views/storagemigrations/actions/useStorageMigrationActions.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: { handler: { $codeRef: 'kubevirtFlags.useShowMigrationSectionFLag' } },
    type: 'console.flag/hookProvider',
  } as EncodedExtension<FeatureFlagHookProvider>,
  {
    flags: {
      required: ['SHOW_MIGRATION_SECTION'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-migration',
        'data-testid': 'migration-nav-item',
      },
      id: 'migration',
      insertAfter: ['virtualization', 'workloads'],
      name: '%plugin__kubevirt-plugin~Migration%',
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,

  {
    properties: {
      component: { $codeRef: 'StorageMigrationList' },
      model: {
        group: 'migration.openshift.io',
        kind: 'MigPlan',
        version: 'v1alpha1',
      },
    },
    type: 'console.page/resource/list',
  },

  {
    flags: {
      required: ['STORAGE_MIGRATION_ENABLED'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-storagemigrations',
        'data-test-id': 'storagemigrations-nav-item',
      },
      id: 'storagemigrations',
      model: {
        group: 'migration.openshift.io',
        kind: 'MigPlan',
        version: 'v1alpha1',
      },
      name: '%plugin__kubevirt-plugin~Storage migrations%',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    flags: {
      required: ['STORAGE_MIGRATION_ENABLED'],
    },
    properties: {
      model: {
        group: 'migration.openshift.io',
        kind: 'MigPlan',
        version: 'v1alpha1',
      },
      provider: {
        $codeRef: 'useStorageMigrationActions',
      },
    },
    type: 'console.action/resource-provider',
  } as EncodedExtension<ResourceActionProvider>,
];
