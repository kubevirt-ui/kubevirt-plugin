import type { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { FLEET_TEMPLATES_PATH, FLEET_VIRTUAL_MACHINES_PATH } from '../constants';

export const templateRouteExtensions: EncodedExtension[] = [
  {
    properties: {
      component: {
        $codeRef: 'VirtualMachineTemplatesList',
      },
      path: [
        `${FLEET_TEMPLATES_PATH}/all-clusters/all-namespaces`,
        `${FLEET_TEMPLATES_PATH}/cluster/:cluster/ns/:ns`,
        `${FLEET_TEMPLATES_PATH}/cluster/:cluster/all-namespaces`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'TemplateNavPage',
      },
      path: [`${FLEET_TEMPLATES_PATH}/cluster/:cluster/ns/:ns/:name`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'TemplateNavPage',
      },
      path: [`${FLEET_TEMPLATES_PATH}/cluster/:cluster/ns/:ns/vmt/:name`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'MulticlusterYAMLCreation',
      },
      path: [
        `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/ns/:ns/~new`,
        `${FLEET_TEMPLATES_PATH}/cluster/:cluster/ns/:ns/~new`,
      ],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
