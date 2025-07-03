import { SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';

import { FLAG_KUBEVIRT_DYNAMIC_ACM } from './constants';

export const enableKubevirtDynamicACMFlag = (setFeatureFlag: SetFeatureFlag) =>
  setFeatureFlag(FLAG_KUBEVIRT_DYNAMIC_ACM, true);
