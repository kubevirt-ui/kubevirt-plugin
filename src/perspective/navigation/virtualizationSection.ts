import { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { extensions } from '../../views/navigation/virtualizationSection';
import { adaptNavForPerspective } from '../utils';

export const virtualizationSection: EncodedExtension[] = adaptNavForPerspective(extensions);
