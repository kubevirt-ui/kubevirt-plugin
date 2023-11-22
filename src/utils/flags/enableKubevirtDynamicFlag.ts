import { SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';

import { FLAG_KUBEVIRT_DYNAMIC } from './consts';

export const enableKubevirtDynamicFlag = (setFeatureFlag: SetFeatureFlag) =>
  setFeatureFlag(FLAG_KUBEVIRT_DYNAMIC, true);
