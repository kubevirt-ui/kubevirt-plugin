import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { AUTO_RESOURCE_LIMITS_FEATURE_GATE } from './constants';

export const updateAutoResourceLimitsFeatureGate = (hcoCR: HyperConverged, switchState: boolean) =>
  k8sPatch<HyperConverged>({
    data: [
      {
        op: hcoCR?.spec?.featureGates ? K8S_OPS.ADD : K8S_OPS.REPLACE,
        path: '/spec/featureGates',
        value: { [AUTO_RESOURCE_LIMITS_FEATURE_GATE]: switchState },
      },
    ],
    model: HyperConvergedModel,
    resource: hcoCR,
  });
