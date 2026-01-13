import { HrefNavItem, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  PhysicalNetworksPage: './views/physical-networks/PhysicalNetworksPage',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['NMSTATE_DYNAMIC'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-physical-networks',
        'data-test-id': 'physical-networks-nav-item',
      },
      href: 'physical-networks',
      id: 'physical-networks',
      insertBefore: 'networkPolicies',
      name: '%plugin__kubevirt-plugin~Physical networks%',
      prefixNamespaced: false,
      section: 'networking',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['NMSTATE_DYNAMIC'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-physical-networks',
        'data-test-id': 'physical-networks-nav-item',
      },
      href: 'physical-networks',
      id: 'physical-networks-virt-perspective',
      insertBefore: 'networkPolicies',
      name: '%plugin__kubevirt-plugin~Physical networks%',
      perspective: 'virtualization-perspective',
      prefixNamespaced: false,
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    flags: {
      required: ['NMSTATE_DYNAMIC'],
    },
    properties: {
      component: {
        $codeRef: 'PhysicalNetworksPage',
      },
      path: ['physical-networks'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
