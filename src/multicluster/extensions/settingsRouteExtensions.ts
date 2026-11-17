import type { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { FLEET_SETTINGS_PATH } from '../constants';

export const settingsRouteExtensions: EncodedExtension[] = [
  {
    properties: {
      component: {
        $codeRef: 'SettingsPage',
      },
      path: [FLEET_SETTINGS_PATH, `${FLEET_SETTINGS_PATH}/*`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
