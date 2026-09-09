import {
  type HrefNavItem,
  type ResourceClusterNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import { type EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { NAV_ID, VIRT_SECTION_ID } from '../constants';

export const operationsSectionNavItems: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-migrationpolicies',
        'data-test': 'migrationpolicies-nav-item',
      },
      id: NAV_ID.MIGRATION_POLICIES,
      insertAfter: NAV_ID.SEPARATOR_2,
      model: {
        group: 'migrations.kubevirt.io',
        kind: 'MigrationPolicy',
        version: 'v1alpha1',
      },
      name: '%plugin__kubevirt-plugin~MigrationPolicies%',
      section: VIRT_SECTION_ID,
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    flags: {
      required: ['KUBEVIRT_QUOTAS'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-quotas',
        'data-test': 'quotas-nav-item',
      },
      href: 'quotas',
      id: NAV_ID.QUOTAS,
      insertAfter: NAV_ID.MIGRATION_POLICIES,
      insertBefore: NAV_ID.CHECKUPS,
      name: '%plugin__kubevirt-plugin~Quotas%',
      prefixNamespaced: true,
      section: VIRT_SECTION_ID,
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualization-checkups',
        'data-test': 'virtualization-checkups-nav-item',
      },
      href: 'checkups',
      id: NAV_ID.CHECKUPS,
      insertAfter: [NAV_ID.QUOTAS, NAV_ID.MIGRATION_POLICIES],
      name: '%plugin__kubevirt-plugin~Checkups%',
      prefixNamespaced: true,
      section: VIRT_SECTION_ID,
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-test': 'virtualization-settings-nav-item',
      },
      href: 'virtualization-settings',
      id: NAV_ID.SETTINGS,
      insertAfter: NAV_ID.SEPARATOR_3,
      name: '%plugin__kubevirt-plugin~Settings%',
      prefixNamespaced: true,
      section: VIRT_SECTION_ID,
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];
