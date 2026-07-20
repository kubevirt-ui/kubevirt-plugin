import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  FeatureFlagHookProvider,
  NavSection,
  ResourceNSNavItem,
  RoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  StorageMigrationList: './views/storagemigrations/list/StorageMigrationList.tsx',
  useStorageMigrationActionsProvider:
    './views/storagemigrations/actions/useStorageMigrationActions.tsx',
};

const multiNamespaceStorageMigrationPlanModel = {
  group: 'migrations.kubevirt.io',
  kind: 'MultiNamespaceVirtualMachineStorageMigrationPlan',
  version: 'v1alpha1',
};

export const extensions: EncodedExtension[] = [
  {
    properties: { handler: { $codeRef: 'kubevirtFlags.useShowMigrationSectionFLag' } },
    type: 'console.flag/hookProvider',
  } as EncodedExtension<FeatureFlagHookProvider>,
  {
    properties: { handler: { $codeRef: 'kubevirtFlags.useStorageMigrationFeatureFlags' } },
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
      path: ['/k8s/ns/:ns/storagemigrations', '/k8s/all-namespaces/storagemigrations'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: { $codeRef: 'StorageMigrationList' },
      model: multiNamespaceStorageMigrationPlanModel,
      prefixNamespaced: true,
    },
    type: 'console.page/resource/list',
  },
  {
    flags: {
      required: ['SHOW_MIGRATION_SECTION'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-storagemigrations',
        'data-test-id': 'storagemigrations-nav-item',
      },
      id: 'storagemigrations',
      model: multiNamespaceStorageMigrationPlanModel,
      name: '%plugin__kubevirt-plugin~Storage migrations%',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,

  {
    properties: {
      model: multiNamespaceStorageMigrationPlanModel,
      provider: {
        $codeRef: 'useStorageMigrationActionsProvider',
      },
    },
    type: 'console.action/resource-provider',
  },
];
