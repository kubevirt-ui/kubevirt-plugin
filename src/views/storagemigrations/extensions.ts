import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  FeatureFlagHookProvider,
  HrefNavItem,
  NavSection,
  ResourceActionProvider,
  RoutePage,
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
    flags: {
      required: ['SHOW_MIGRATION_SECTION'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-migration-virt-perspective',
        'data-testid': 'migration-virt-perspective-nav-item',
      },
      id: 'migration-virt-perspective',
      insertAfter: 'virtualization-virt-perspective',
      insertBefore: 'networking-virt-perspective',
      name: '%plugin__kubevirt-plugin~Migration%',
      perspective: 'virtualization-perspective',
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
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
  {
    flags: {
      required: ['STORAGE_MIGRATION_ENABLED'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-storagemigrations-virt-perspective',
        'data-test-id': 'storagemigrations-virt-perspective-nav-item',
      },
      href: '/k8s/storagemigrations',
      id: 'storagemigrations-virt-perspective',
      name: '%plugin__kubevirt-plugin~Storage MigrationPlans%',
      prefixNamespaced: false,
      section: 'migration-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];
