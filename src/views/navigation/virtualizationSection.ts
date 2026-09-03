import { type NavSection } from '@openshift-console/dynamic-plugin-sdk';
import { type EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { FLAG_KUBEVIRT_VIRTUALIZATION_NAV } from '../../utils/flags/consts';
import { VIRT_SECTION_ID } from './constants';
import { operationsSectionNavItems } from './sections/operationsSection';
import { resourceSectionNavItems } from './sections/resourceSection';
import { navSeparators } from './sections/separators';
import { vmSectionNavItems } from './sections/vmSection';

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: [FLAG_KUBEVIRT_VIRTUALIZATION_NAV],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-virtualization',
        'data-test': 'virtualization-nav-item',
      },
      id: VIRT_SECTION_ID,
      insertAfter: 'workloads',
      name: '%plugin__kubevirt-plugin~Virtualization%',
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  ...vmSectionNavItems,
  ...navSeparators,
  ...resourceSectionNavItems,
  ...operationsSectionNavItems,
];
