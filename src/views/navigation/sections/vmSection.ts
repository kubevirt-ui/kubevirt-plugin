import { type HrefNavItem, type ResourceNSNavItem } from '@openshift-console/dynamic-plugin-sdk';
import { type EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { NAV_ID, VIRT_SECTION_ID } from '../constants';

export const vmSectionNavItems: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualmachines',
        'data-test': 'virtualmachines-nav-item',
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
        'data-test': 'templates-nav-item',
      },
      href: 'templates',
      id: NAV_ID.TEMPLATES,
      insertAfter: NAV_ID.VIRTUAL_MACHINES,
      name: '%plugin__kubevirt-plugin~Templates%',
      prefixNamespaced: true,
      section: VIRT_SECTION_ID,
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-bootablevolumes',
        'data-test': 'bootablevolumes-nav-item',
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
];
