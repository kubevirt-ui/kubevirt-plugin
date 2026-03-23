import {
  HrefNavItem,
  NavSection,
  ResourceClusterNavItem,
  ResourceNSNavItem,
  Separator,
} from '@openshift-console/dynamic-plugin-sdk';
import { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { NAV_ID, VIRT_SECTION_ID } from './constants';

// Navigation order:
// VirtualMachines
// Templates
// Bootable volumes
// --- separator 1 ---
// InstanceTypes
// Virtual machine networks
// --- separator 2 ---
// MigrationPolicies
// Quotas
// Checkups
// --- separator 3 ---
// Settings

export const extensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-virtualization',
        'data-test-id': 'virtualization-nav-item',
      },
      id: VIRT_SECTION_ID,
      insertAfter: 'workloads',
      name: '%plugin__kubevirt-plugin~Virtualization%',
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualmachines',
        'data-test-id': 'virtualmachines-nav-item',
      },
      id: NAV_ID.VIRTUAL_MACHINES,
      insertAfter: VIRT_SECTION_ID,
      model: {
        group: 'kubevirt.io',
        kind: 'VirtualMachine',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~VirtualMachines%',
      section: VIRT_SECTION_ID,
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-templates',
        'data-test-id': 'templates-nav-item',
      },
      id: NAV_ID.TEMPLATES,
      insertAfter: NAV_ID.VIRTUAL_MACHINES,
      model: {
        group: 'template.openshift.io',
        kind: 'Template',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~Templates%',
      section: VIRT_SECTION_ID,
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-bootablevolumes',
        'data-test-id': 'bootablevolumes-nav-item',
      },
      href: 'bootablevolumes',
      id: NAV_ID.BOOTABLE_VOLUMES,
      insertAfter: NAV_ID.TEMPLATES,
      name: '%plugin__kubevirt-plugin~Bootable volumes%',
      prefixNamespaced: true,
      section: VIRT_SECTION_ID,
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
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
    flags: {
      required: ['KUBEVIRT_INSTANCETYPES'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualmachineclusterinstancetypes',
        'data-test-id': 'virtualmachineclusterinstancetypes-nav-item',
      },
      id: NAV_ID.INSTANCE_TYPES,
      insertAfter: NAV_ID.SEPARATOR_1,
      model: {
        group: 'instancetype.kubevirt.io',
        kind: 'VirtualMachineClusterInstancetype',
        version: 'v1beta1',
      },
      name: '%plugin__kubevirt-plugin~InstanceTypes%',
      section: VIRT_SECTION_ID,
    },
    type: 'console.navigation/resource-cluster',
  } as EncodedExtension<ResourceClusterNavItem>,
  {
    flags: {
      required: ['CAN_LIST_NS', 'NMSTATE_DYNAMIC'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-vmnetwork',
        'data-test-id': 'vmnetwork-nav-item',
      },
      href: '/k8s/cluster/virtualmachine-networks',
      id: NAV_ID.VM_NETWORKS,
      insertAfter: NAV_ID.INSTANCE_TYPES,
      name: '%plugin__kubevirt-plugin~Virtual machine networks%',
      prefixNamespaced: false,
      section: VIRT_SECTION_ID,
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
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
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-migrationpolicies',
        'data-test-id': 'migrationpolicies-nav-item',
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
        'data-test-id': 'quotas-nav-item',
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
        'data-test-id': 'virtualization-checkups-nav-item',
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
      id: NAV_ID.SEPARATOR_3,
      insertAfter: NAV_ID.CHECKUPS,
      insertBefore: NAV_ID.SETTINGS,
      perspective: 'admin',
      section: VIRT_SECTION_ID,
      testID: NAV_ID.SEPARATOR_3,
    },
    type: 'console.navigation/separator',
  } as EncodedExtension<Separator>,
  {
    properties: {
      dataAttributes: {
        'data-test-id': 'virtualization-settings-nav-item',
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
