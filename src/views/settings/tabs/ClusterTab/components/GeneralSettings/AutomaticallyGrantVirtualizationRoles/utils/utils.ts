import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import { HCO_MANUAL_ROLE_AGGREGATION_STRATEGY } from '@kubevirt-utils/flags/consts';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { getHCORoleAggregationStrategy } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import {
  HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY,
  HCO_ROLE_AGGREGATION_STRATEGY_PATH,
} from '../consts/consts';

export const isAutomaticRoleGrantEnabled = (hyperConverge: HyperConverged | undefined): boolean =>
  getHCORoleAggregationStrategy(hyperConverge) !== HCO_MANUAL_ROLE_AGGREGATION_STRATEGY;

export const setRoleAggregationStrategy = (
  hyperConverge: HyperConverged,
  automaticallyGrant: boolean,
  cluster?: string,
) => {
  const hasStrategy = Boolean(getHCORoleAggregationStrategy(hyperConverge));

  return kubevirtK8sPatch<HyperConverged>({
    cluster,
    data: [
      {
        op: hasStrategy ? K8S_OPS.REPLACE : K8S_OPS.ADD,
        path: HCO_ROLE_AGGREGATION_STRATEGY_PATH,
        value: automaticallyGrant
          ? HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY
          : HCO_MANUAL_ROLE_AGGREGATION_STRATEGY,
      },
    ],
    model: HyperConvergedModel,
    resource: hyperConverge,
  });
};
