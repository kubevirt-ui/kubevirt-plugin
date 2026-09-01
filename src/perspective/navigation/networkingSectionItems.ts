import { type ResourceNSNavItem } from '@openshift-console/dynamic-plugin-sdk';
import { type EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { PERSPECTIVES } from '../../utils/constants/constants';

export const extraNetworkingNavItems: EncodedExtension[] = [
  {
    flags: {
      required: ['NET_ATTACH_DEF', 'KUBEVIRT_DYNAMIC'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-nads',
        'data-test': 'nads-nav-item',
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
        'data-test': 'udns-nav-item',
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
