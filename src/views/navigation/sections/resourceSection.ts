import {
  type HrefNavItem,
  type ResourceClusterNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import { type EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { NAV_ID, VIRT_SECTION_ID } from '../constants';

export const resourceSectionNavItems: EncodedExtension[] = [
  {
    flags: {
      required: ['KUBEVIRT_INSTANCETYPES'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-virtualmachineclusterinstancetypes',
        'data-test': 'virtualmachineclusterinstancetypes-nav-item',
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
        'data-test': 'vmnetwork-nav-item',
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
];
