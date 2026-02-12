import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { HrefNavItem, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/build-types';

import { VM_NETWORKS_OTHER_TYPES_PATH, VM_NETWORKS_PATH } from './constants';

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['CAN_LIST_NS', 'NMSTATE_DYNAMIC'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-vmnetwork',
        'data-test-id': 'vmnetwork-nav-item',
      },
      href: 'k8s/cluster/virtualmachine-networks',
      id: 'vmnetwork-virt-perspective',
      insertAfter: 'virtualmachines-virt-perspective',
      name: '%plugin__kubevirt-plugin~Virtual machine networks%',
      perspective: 'virtualization-perspective',
      prefixNamespaced: false,
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['CAN_LIST_NS', 'NMSTATE_DYNAMIC'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-vmnetwork',
        'data-test-id': 'vmnetwork-nav-item',
      },
      href: 'k8s/cluster/virtualmachine-networks',
      id: 'vmnetwork',
      insertAfter: 'virtualmachines',
      name: '%plugin__kubevirt-plugin~Virtual machine networks%',
      prefixNamespaced: false,
      section: 'virtualization',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      component: {
        $codeRef: 'VMNetworksPage',
      },
      path: [VM_NETWORKS_PATH, VM_NETWORKS_OTHER_TYPES_PATH],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'VMNetworkDetailsPage',
      },
      path: [`${VM_NETWORKS_PATH}/:name`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    properties: {
      component: {
        $codeRef: 'VMNetworkNewForm',
      },
      path: [`${VM_NETWORKS_PATH}/~new`],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  VMNetworkDetailsPage: './views/vmnetworks/details/VMNetworkDetailsPage.tsx',
  VMNetworkNewForm: './views/vmnetworks/form/VMNetworkNewForm.tsx',
  VMNetworksPage: './views/vmnetworks/list/VMNetworksPage.tsx',
};
