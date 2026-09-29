import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import {
  HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY,
  HCO_MANUAL_ROLE_AGGREGATION_STRATEGY,
} from '@kubevirt-utils/flags/consts';
import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { getHyperConvergedModelFromResource } from '@kubevirt-utils/resources/hyperconverged/model';
import {
  buildHyperConvergedPatch,
  getRoleAggregationStrategyPatchPath,
} from '@kubevirt-utils/resources/hyperconverged/patchUtils';
import { getHCORoleAggregationStrategy } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

export const isAutomaticRoleGrantEnabled = (hyperConverge: HyperConverged | undefined): boolean =>
  getHCORoleAggregationStrategy(hyperConverge) !== HCO_MANUAL_ROLE_AGGREGATION_STRATEGY;

export const setRoleAggregationStrategy = (
  hyperConverge: HyperConverged,
  automaticallyGrant: boolean,
  cluster?: string,
): Promise<HyperConverged> => {
  const hasStrategy = Boolean(getHCORoleAggregationStrategy(hyperConverge));

  return kubevirtK8sPatch<HyperConverged>({
    cluster,
    data: buildHyperConvergedPatch(hyperConverge, {
      op: hasStrategy ? K8S_OPS.REPLACE : K8S_OPS.ADD,
      path: getRoleAggregationStrategyPatchPath(hyperConverge),
      value: automaticallyGrant
        ? HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY
        : HCO_MANUAL_ROLE_AGGREGATION_STRATEGY,
    }),
    model: getHyperConvergedModelFromResource(hyperConverge),
    resource: hyperConverge,
  });
};
