import { HrefNavItem, NavSection } from '@openshift-console/dynamic-plugin-sdk';
import { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { PERSPECTIVES } from '../../utils/constants/constants';
import { NAV_ID } from '../../views/navigation/constants';
import { suffixId } from '../utils';

export const clusterSection: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-virtualization',
        'data-test-id': 'virtualization-nav-item',
      },
      id: 'cluster-virt-perspective',
      insertAfter: suffixId(NAV_ID.SETTINGS),
      insertBefore: 'networking',
      name: '%plugin__kubevirt-plugin~Cluster%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-cluster-overview',
        'data-test-id': 'cluster-overview-nav-item',
      },
      href: '/dashboards',
      id: 'overview-virt-perspective',
      name: '%plugin__kubevirt-plugin~Overview%',
      perspective: PERSPECTIVES.VIRTUALIZATION,
      section: 'cluster-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];
