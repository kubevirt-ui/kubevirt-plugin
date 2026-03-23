import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import { Perspective } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { PERSPECTIVES } from '../utils/constants/constants';

import { clusterSection } from './navigation/clusterSection';
import { computeSection } from './navigation/computeSection';
import { migrationSection } from './navigation/migrationSection';
import { networkingSection } from './navigation/networkingSection';
import { storageSection } from './navigation/storageSection';
import { virtualizationSection } from './navigation/virtualizationSection';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  perspective: './perspective/perspective.ts',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      disallowed: ['KUBEVIRT_DYNAMIC_ACM'],
    },
    properties: {
      icon: { $codeRef: 'perspective.icon' },
      id: PERSPECTIVES.VIRTUALIZATION,
      importRedirectURL: { $codeRef: 'perspective.getImportRedirectURL' },
      landingPageURL: { $codeRef: 'perspective.getVirtualizationLandingPageURL' },
      name: '%plugin__kubevirt-plugin~Virtualization%',
    },
    type: 'console.perspective',
  } as EncodedExtension<Perspective>,
  ...virtualizationSection,
  ...clusterSection,
  ...migrationSection,
  ...networkingSection,
  ...storageSection,
  ...computeSection,
];
