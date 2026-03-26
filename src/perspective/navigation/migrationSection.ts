import { NavSection, ResourceNSNavItem } from '@openshift-console/dynamic-plugin-sdk';
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
        'data-testid': 'migration-virt-perspective-nav-item',
      },
      id: 'migration-virt-perspective',
      insertAfter: 'cluster-virt-perspective',
      name: '%plugin__kubevirt-plugin~Migration%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-storagemigrations-virt-perspective',
        'data-test-id': 'storagemigrations-virt-perspective-nav-item',
      },
      id: 'storagemigrations-virt-perspective',
      model: {
        group: 'migration.openshift.io',
        kind: 'MigPlan',
        version: 'v1alpha1',
      },
      name: '%plugin__kubevirt-plugin~Storage migrations%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'migration-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
];
