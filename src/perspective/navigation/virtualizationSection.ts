import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { adaptNavForPerspective } from '../utils';

import { extensions } from '../../views/navigation/virtualizationSection';

export const virtualizationSection: EncodedExtension[] = adaptNavForPerspective(extensions);
