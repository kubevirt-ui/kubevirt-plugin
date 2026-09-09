import { type Separator } from '@openshift-console/dynamic-plugin-sdk';
import { type EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { NAV_ID, VIRT_SECTION_ID } from '../constants';

export const navSeparators: EncodedExtension[] = [
  {
    properties: {
      id: NAV_ID.SEPARATOR_1,
      insertAfter: NAV_ID.BOOTABLE_VOLUMES,
      insertBefore: NAV_ID.INSTANCE_TYPES,
      perspective: 'admin',
      section: VIRT_SECTION_ID,
      testID: NAV_ID.SEPARATOR_1,
    },
    type: 'console.navigation/separator',
  } as EncodedExtension<Separator>,
  {
    properties: {
      id: NAV_ID.SEPARATOR_2,
      insertAfter: NAV_ID.VM_NETWORKS,
      insertBefore: NAV_ID.MIGRATION_POLICIES,
      perspective: 'admin',
      section: VIRT_SECTION_ID,
      testID: NAV_ID.SEPARATOR_2,
    },
    type: 'console.navigation/separator',
  } as EncodedExtension<Separator>,
  {
    properties: {
      id: NAV_ID.SEPARATOR_3,
      insertAfter: NAV_ID.CHECKUPS,
      insertBefore: NAV_ID.SETTINGS,
      perspective: 'admin',
      section: VIRT_SECTION_ID,
      testID: NAV_ID.SEPARATOR_3,
    },
    type: 'console.navigation/separator',
  } as EncodedExtension<Separator>,
];
