import type { HrefNavItem, Separator } from '@openshift-console/dynamic-plugin-sdk';
import type { Perspective } from '@openshift-console/dynamic-plugin-sdk';
import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import {
  FLAG_DISALLOWED_KUBEVIRT_DYNAMIC_ACM,
  FLEET_BOOTABLE_VOLUMES_PATH,
  FLEET_CHECKUPS_PATH,
  FLEET_INSTANCETYPES_PATH,
  FLEET_MIGRATION_POLICIES_PATH,
  FLEET_NS_INSTANCETYPES_PATH,
  FLEET_TEMPLATES_PATH,
  FLEET_VIRTUAL_MACHINES_PATH,
} from '../constants';

import { PERSPECTIVES } from '../../utils/constants/constants';
import { FLAG_KUBEVIRT_VIRTUALIZATION_NAV } from '../../utils/flags/consts';

export const perspectiveExtension: EncodedExtension<Perspective> = {
  flags: {
    disallowed: [FLAG_DISALLOWED_KUBEVIRT_DYNAMIC_ACM],
    required: [FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
  },
  properties: {
    icon: { $codeRef: 'perspective.icon' },
    id: PERSPECTIVES.FLEET_VIRTUALIZATION,
    importRedirectURL: { $codeRef: 'perspective.getACMLandingPageURL' },
    landingPageURL: { $codeRef: 'perspective.getACMLandingPageURL' },
    name: '%plugin__kubevirt-plugin~Fleet virtualization%',
  },
  type: 'console.perspective',
};

export const navigationExtensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualmachines',
        'data-test': 'virtualmachines-nav-item',
      },
      href: `${FLEET_VIRTUAL_MACHINES_PATH}/all-clusters/all-namespaces`,
      id: 'virtualmachines-virt-perspective',
      name: '%plugin__kubevirt-plugin~VirtualMachines%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_VIRTUAL_MACHINES_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-templates',
        'data-test': 'templates-nav-item',
      },
      href: `${FLEET_TEMPLATES_PATH}/all-clusters/all-namespaces`,
      id: 'templates-virt-perspective',
      insertAfter: 'virtualmachines-virt-perspective',
      name: '%plugin__kubevirt-plugin~Templates%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_TEMPLATES_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-bootablevolumes',
        'data-test': 'bootablevolumes-nav-item',
      },
      href: `${FLEET_BOOTABLE_VOLUMES_PATH}/all-clusters/all-namespaces`,
      id: 'bootablevolumes-virt-perspective',
      insertAfter: 'templates-virt-perspective',
      name: '%plugin__kubevirt-plugin~Bootable volumes%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_BOOTABLE_VOLUMES_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      id: 'acm-separator-1',
      insertAfter: 'bootablevolumes-virt-perspective',
      insertBefore: 'instancetype-virt-perspective',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      testID: 'acm-separator-1',
    },
    type: 'console.navigation/separator',
  } as EncodedExtension<Separator>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-instancetype',
        'data-test': 'instancetype-nav-item',
      },
      href: `${FLEET_INSTANCETYPES_PATH}/all-clusters/all-namespaces`,
      id: 'instancetype-virt-perspective',
      insertAfter: 'acm-separator-1',
      name: '%plugin__kubevirt-plugin~InstanceTypes%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_INSTANCETYPES_PATH.slice(1), FLEET_NS_INSTANCETYPES_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      id: 'acm-separator-2',
      insertAfter: 'instancetype-virt-perspective',
      insertBefore: 'migrationpolicies-virt-perspective',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      testID: 'acm-separator-2',
    },
    type: 'console.navigation/separator',
  } as EncodedExtension<Separator>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-migrationpolicies',
        'data-test': 'migrationpolicies-nav-item',
      },
      href: `${FLEET_MIGRATION_POLICIES_PATH}/all-clusters`,
      id: 'migrationpolicies-virt-perspective',
      insertAfter: 'acm-separator-2',
      name: '%plugin__kubevirt-plugin~MigrationPolicies%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_MIGRATION_POLICIES_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-checkups',
        'data-test': 'checkups-nav-item',
      },
      href: `${FLEET_CHECKUPS_PATH}/all-clusters/all-namespaces/storage`,
      id: 'checkups-virt-perspective',
      insertAfter: 'migrationpolicies-virt-perspective',
      name: '%plugin__kubevirt-plugin~Checkups%',
      perspective: PERSPECTIVES.FLEET_VIRTUALIZATION,
      startsWith: [FLEET_CHECKUPS_PATH.slice(1)],
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];
