import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  FeatureFlagHookProvider,
  HrefNavItem,
  NavSection,
  RoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  StorageMigrationList: './views/storagemigrations/list/StorageMigrationList.tsx',
  useStorageMigrationActionsProvider:
    './views/storagemigrations/actions/useStorageMigrationActions.tsx',
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
    flags: {
      required: ['SHOW_MIGRATION_SECTION'],
    },
    properties: {
      component: { $codeRef: 'StorageMigrationList' },
      path: ['/k8s/ns/:ns/storagemigrations', '/k8s/all-namespaces/storagemigrations'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['SHOW_MIGRATION_SECTION'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-storagemigrations',
        'data-test-id': 'storagemigrations-nav-item',
      },
      href: 'storagemigrations',
      id: 'storagemigrations',
      name: '%plugin__kubevirt-plugin~Storage migrations%',
      prefixNamespaced: true,
      section: 'migration',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,

  {
    properties: {
      model: {
        group: 'migrations.kubevirt.io',
        kind: 'MultiNamespaceVirtualMachineStorageMigrationPlan',
        version: 'v1alpha1',
      },
      provider: {
        $codeRef: 'useStorageMigrationActionsProvider',
      },
    },
    type: 'console.action/resource-provider',
  },
];
