import type { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { FLEET_BOOTABLE_VOLUMES_PATH, FLEET_MIGRATION_POLICIES_PATH } from '../constants';

export const migrationRouteExtensions: EncodedExtension[] = [
  {
    properties: {
      component: {
        $codeRef: 'MigrationPoliciesList',
      },
      path: [
        `${FLEET_MIGRATION_POLICIES_PATH}/all-clusters`,
        `${FLEET_MIGRATION_POLICIES_PATH}/cluster/:cluster`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'MigrationPolicyPage',
      },
      path: [`${FLEET_MIGRATION_POLICIES_PATH}/cluster/:cluster/:name`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'MigrationPolicyCreateForm',
      },
      path: [`${FLEET_MIGRATION_POLICIES_PATH}/cluster/:cluster/form`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'MulticlusterYAMLCreation',
      },
      path: [`${FLEET_MIGRATION_POLICIES_PATH}/cluster/:cluster/~new`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'MulticlusterYAMLCreation',
      },
      path: [`${FLEET_BOOTABLE_VOLUMES_PATH}/cluster/:cluster/ns/:ns/datavolume/~new`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
