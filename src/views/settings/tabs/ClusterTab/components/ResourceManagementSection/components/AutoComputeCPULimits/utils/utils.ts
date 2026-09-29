import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { buildFeatureGatePatches } from '@kubevirt-utils/resources/hyperconverged/featureGates';
import { getHyperConvergedModelFromResource } from '@kubevirt-utils/resources/hyperconverged/model';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { AUTO_RESOURCE_LIMITS_FEATURE_GATE } from './constants';

export const updateAutoResourceLimitsFeatureGate = (
  hcoCR: HyperConverged,
  switchState: boolean,
  cluster?: string,
): Promise<HyperConverged> =>
  kubevirtK8sPatch<HyperConverged>({
    cluster,
    data: buildFeatureGatePatches(hcoCR, AUTO_RESOURCE_LIMITS_FEATURE_GATE, switchState),
    model: getHyperConvergedModelFromResource(hcoCR),
    resource: hcoCR,
  });
