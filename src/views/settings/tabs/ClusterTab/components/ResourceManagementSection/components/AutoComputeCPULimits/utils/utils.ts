import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { AUTO_RESOURCE_LIMITS_FEATURE_GATE } from './constants';

export const updateAutoResourceLimitsFeatureGate = (
  hcoCR: HyperConverged,
  switchState: boolean,
  cluster?: string,
) =>
  kubevirtK8sPatch<HyperConverged>({
    cluster,
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
