import type { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { FLEET_CHECKUPS_PATH } from '../constants';

export const checkupRouteExtensions: EncodedExtension[] = [
  {
    properties: {
      component: {
        $codeRef: 'Checkups',
      },
      path: [
        `${FLEET_CHECKUPS_PATH}/all-clusters/all-namespaces`,
        `${FLEET_CHECKUPS_PATH}/cluster/:cluster/all-namespaces`,
        `${FLEET_CHECKUPS_PATH}/cluster/:cluster/ns/:ns`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'CheckupsStorageForm',
      },
      path: [`${FLEET_CHECKUPS_PATH}/cluster/:cluster/ns/:ns/storage/form`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'CheckupsStorageDetailsPage',
      },
      path: [`${FLEET_CHECKUPS_PATH}/cluster/:cluster/ns/:ns/storage/:checkupName`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'CheckupsSelfValidationForm',
      },
      path: [`${FLEET_CHECKUPS_PATH}/cluster/:cluster/ns/:ns/self-validation/form`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'CheckupsSelfValidationDetailsPage',
      },
      path: [`${FLEET_CHECKUPS_PATH}/cluster/:cluster/ns/:ns/self-validation/:checkupName`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
