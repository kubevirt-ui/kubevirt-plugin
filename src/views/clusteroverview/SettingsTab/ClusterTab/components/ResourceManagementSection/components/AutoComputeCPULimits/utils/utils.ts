import { HyperConvergedModel } from '@kubevirt-ui/kubevirt-api/console';
import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { AUTO_RESOURCE_LIMITS_FEATURE_GATE } from './constants';

export const updateAutoResourceLimitsFeatureGate = (hcoCR: HyperConverged, switchState: boolean) =>
  k8sPatch<HyperConverged>({
    data: [
      {
        op: K8S_OPS.REPLACE,
        path: `/spec/featureGates/${AUTO_RESOURCE_LIMITS_FEATURE_GATE}`,
        value: switchState,
      },
    ],
    model: HyperConvergedModel,
    resource: hcoCR,
  });
