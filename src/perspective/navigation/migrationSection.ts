import type { HrefNavItem, NavSection } from '@openshift-console/dynamic-plugin-sdk';
import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { PERSPECTIVES } from '../../utils/constants/constants';
import { COMPUTE_MIGRATIONS_PAGE_PATH } from '../../views/migrations/constants';

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
        'data-quickstart-id': 'qs-nav-compute-migrations-virt-perspective',
        'data-test': 'compute-migrations-virt-perspective-nav-item',
      },
      href: COMPUTE_MIGRATIONS_PAGE_PATH,
      id: 'compute-migrations-virt-perspective',
      name: '%plugin__kubevirt-plugin~Compute migrations%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      prefixNamespaced: true,
      section: 'migration-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
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
