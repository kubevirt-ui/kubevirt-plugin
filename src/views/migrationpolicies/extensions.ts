import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  ResourceDetailsPage,
  ResourceListPage,
  RoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  MigrationPoliciesList: './views/migrationpolicies/list/MigrationPoliciesList.tsx',
  MigrationPolicyCreateForm:
    './views/migrationpolicies/list/components/MigrationPolicyCreateForm/MigrationPolicyCreateForm.tsx',
  MigrationPolicyPage: './views/migrationpolicies/details/MigrationPolicyDetailsNav.tsx',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      component: { $codeRef: 'MigrationPoliciesList' },
      model: {
        group: 'migrations.kubevirt.io',
        kind: 'MigrationPolicy',
        version: 'v1alpha1',
      },
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,
  {
    properties: {
      component: { $codeRef: 'MigrationPolicyPage' },
      model: {
        group: 'migrations.kubevirt.io',
        kind: 'MigrationPolicy',
        version: 'v1alpha1',
      },
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,
  {
    properties: {
      component: {
        $codeRef: 'MigrationPolicyCreateForm',
      },
      path: '/k8s/cluster/migrations.kubevirt.io~v1alpha1~MigrationPolicy/form',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
