import { NavSection, ResourceNSNavItem } from '@openshift-console/dynamic-plugin-sdk';
import { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { PERSPECTIVES } from '../../utils/constants/constants';

export const networkingSection: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: { 'data-quickstart-id': 'qs-nav-networking' },
      id: 'networking-virt-perspective',
      insertAfter: 'migration-virt-perspective',
      name: '%plugin__kubevirt-plugin~Networking%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-services',
        'data-test-id': 'services-nav-item',
      },
      id: 'services-virt-perspective',
      model: {
        kind: 'Service',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~Services%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    flags: { required: ['OPENSHIFT'] },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-routes',
        'data-test-id': 'routes-nav-item',
      },
      id: 'routes-virt-perspective',
      insertAfter: 'services-virt-perspective',
      model: {
        group: 'route.openshift.io',
        kind: 'Route',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~Routes%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-ingresses',
        'data-test-id': 'ingresses-nav-item',
      },
      id: 'ingresses-virt-perspective',
      insertAfter: 'routes-virt-perspective',
      model: {
        group: 'networking.k8s.io',
        kind: 'Ingress',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~Ingresses%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-networkpolicies',
        'data-test-id': 'networkpolicies-nav-item',
      },
      id: 'networkpolicies-virt-perspective',
      insertAfter: 'ingresses-virt-perspective',
      model: {
        group: 'networking.k8s.io',
        kind: 'NetworkPolicy',
        version: 'v1',
      },
      name: '%plugin__kubevirt-plugin~NetworkPolicies%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
  {
    flags: { required: ['MULTI_NETWORK_POLICY_ENABLED'] },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-multinetworkpolicies',
        'data-test-id': 'multinetworkpolicies-nav-item',
      },
      id: 'multinetworkpolicies-virt-perspective',
      insertAfter: 'networkpolicies-virt-perspective',
      model: {
        group: 'k8s.cni.cncf.io',
        kind: 'MultiNetworkPolicy',
        version: 'v1beta1',
      },
      name: '%console-app~MultiNetworkPolicies%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
  {
    flags: {
      required: ['NET_ATTACH_DEF', 'KUBEVIRT_DYNAMIC'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-nads',
        'data-test-id': 'nads-nav-item',
      },
      id: 'networkattachmentdefinitions-virt-perspective',
      model: {
        group: 'k8s.cni.cncf.io',
        kind: 'NetworkAttachmentDefinition',
        version: 'v1',
      },
      name: 'NetworkAttachmentDefinitions',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
  {
    flags: {
      required: ['FLAG_UDN_ENABLED'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-udns',
        'data-test-id': 'udns-nav-item',
      },
      id: 'udns-virt-perspective',
      model: {
        group: 'k8s.ovn.org',
        kind: 'UserDefinedNetwork',
        version: 'v1',
      },
      name: '%plugin__networking-console-plugin~UserDefinedNetworks%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'networking-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
];
