import { HrefNavItem, NavSection } from '@openshift-console/dynamic-plugin-sdk';
import { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { PERSPECTIVES } from '../../utils/constants/constants';

export const migrationSection: EncodedExtension[] = [
  {
    flags: {
      required: ['SHOW_MIGRATION_SECTION'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-migration-virt-perspective',
        'data-test': 'migration-virt-perspective-nav-item',
      },
      id: 'migration-virt-perspective',
      insertAfter: 'cluster-virt-perspective',
      name: '%plugin__kubevirt-plugin~Migration%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  {
    flags: {
      required: ['SHOW_MIGRATION_SECTION'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-storagemigrations-virt-perspective',
        'data-test': 'storagemigrations-virt-perspective-nav-item',
      },
      href: 'storagemigrations',
      id: 'storagemigrations-virt-perspective',
      name: '%plugin__kubevirt-plugin~Storage migrations%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      prefixNamespaced: true,
      section: 'migration-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];
