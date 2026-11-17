import type { HrefNavItem } from '@openshift-console/dynamic-plugin-sdk';
import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import {
  FLAG_DISALLOWED_KUBEVIRT_DYNAMIC_ACM,
  FLAG_KUBEVIRT_DYNAMIC_ACM,
  FLEET_SETTINGS_PATH,
} from '../constants';

import { PERSPECTIVES } from '../../utils/constants/constants';

export const fleetSettingsNavigationExtensions: EncodedExtension[] = [
  {
    flags: {
      disallowed: [FLAG_DISALLOWED_KUBEVIRT_DYNAMIC_ACM],
      required: [FLAG_KUBEVIRT_DYNAMIC_ACM],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualization-settings',
        'data-test': 'virtualization-settings-nav-item',
      },
      href: FLEET_SETTINGS_PATH,
      id: 'virtualization-settings-fleet-perspective',
      insertAfter: ['checkups-virt-perspective', 'migrationpolicies-virt-perspective'],
      name: '%plugin__kubevirt-plugin~Settings%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_SETTINGS_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];
