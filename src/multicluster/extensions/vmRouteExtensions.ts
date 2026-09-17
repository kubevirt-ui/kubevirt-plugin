import type { RoutePage, StandaloneRoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import {
  FLEET_BOOTABLE_VOLUMES_PATH,
  FLEET_INSTANCETYPES_PATH,
  FLEET_NS_INSTANCETYPES_PATH,
  FLEET_VIRTUAL_MACHINES_PATH,
  FLEET_WIZARD_PATH,
} from '../constants';

export const vmRouteExtensions: EncodedExtension[] = [
  {
    properties: {
      component: { $codeRef: 'ConsoleStandAlone' },
      exact: false,
      path: [`${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/ns/:ns/:name/console/standalone`],
    },
    type: 'console.page/route/standalone',
  } as EncodedExtension<StandaloneRoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'Navigator',
      },
      path: [
        `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/ns/:ns/:name`,
        `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/ns/:ns`,
        `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/all-namespaces`,
        `${FLEET_VIRTUAL_MACHINES_PATH}/all-clusters/ns/:ns`,
        `${FLEET_VIRTUAL_MACHINES_PATH}/all-clusters/all-namespaces`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'InstanceTypePage',
      },
      path: [
        `${FLEET_INSTANCETYPES_PATH}/cluster/:cluster/:name`,
        `${FLEET_INSTANCETYPES_PATH}/cluster/:cluster`,
        `${FLEET_INSTANCETYPES_PATH}/all-clusters`,
        `${FLEET_NS_INSTANCETYPES_PATH}/cluster/:cluster/ns/:ns/:name`,
        `${FLEET_NS_INSTANCETYPES_PATH}/cluster/:cluster/ns/:ns`,
        `${FLEET_NS_INSTANCETYPES_PATH}/cluster/:cluster/all-namespaces`,
        `${FLEET_NS_INSTANCETYPES_PATH}/all-clusters/all-namespaces`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'BootableVolumeYAMLPage',
      },
      path: [`${FLEET_BOOTABLE_VOLUMES_PATH}/cluster/:cluster/ns/:ns/~new`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'BootableVolumesList',
      },
      path: [
        `${FLEET_BOOTABLE_VOLUMES_PATH}/cluster/:cluster/ns/:ns`,
        `${FLEET_BOOTABLE_VOLUMES_PATH}/cluster/:cluster/all-namespaces`,
        `${FLEET_BOOTABLE_VOLUMES_PATH}/all-clusters/all-namespaces`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'VMWizard',
      },
      path: [FLEET_WIZARD_PATH],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
