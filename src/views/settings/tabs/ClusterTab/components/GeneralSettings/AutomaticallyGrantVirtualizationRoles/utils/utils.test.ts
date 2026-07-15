import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { HCO_MANUAL_ROLE_AGGREGATION_STRATEGY } from '@kubevirt-utils/flags/consts';
import {
  HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY,
  HCO_ROLE_AGGREGATION_STRATEGY_PATH,
} from '../consts/consts';
import { isAutomaticRoleGrantEnabled, setRoleAggregationStrategy } from './utils';

jest.mock('@multicluster/k8sRequests', () => ({
  kubevirtK8sPatch: jest.fn(),
}));

const mockKubevirtK8sPatch = kubevirtK8sPatch as jest.Mock;

const createHyperConverge = (strategy?: string): HyperConverged =>
  ({
    metadata: { name: 'kubevirt-hyperconverged', namespace: 'openshift-cnv' },
    spec: {
      ...(strategy ? { roleAggregationStrategy: strategy } : {}),
    },
  }) as HyperConverged;

describe('AutomaticallyGrantVirtualizationRoles utils', () => {
  beforeEach(() => {
    mockKubevirtK8sPatch.mockReset();
    mockKubevirtK8sPatch.mockResolvedValue({});
  });

  describe('isAutomaticRoleGrantEnabled', () => {
    it('returns true when strategy is unset', () => {
      expect(isAutomaticRoleGrantEnabled(createHyperConverge())).toBe(true);
    });

    it('returns true when strategy is AggregateToDefault', () => {
      expect(
        isAutomaticRoleGrantEnabled(
          createHyperConverge(HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY),
        ),
      ).toBe(true);
    });

    it('returns false when strategy is Manual', () => {
      expect(
        isAutomaticRoleGrantEnabled(createHyperConverge(HCO_MANUAL_ROLE_AGGREGATION_STRATEGY)),
      ).toBe(false);
    });
  });

  describe('updateRoleAggregationStrategy', () => {
    it('ADDs AggregateToDefault when field is missing', async () => {
      const hyperConverge = createHyperConverge();

      await setRoleAggregationStrategy(hyperConverge, true, 'cluster-a');

      expect(mockKubevirtK8sPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          cluster: 'cluster-a',
          data: [
            {
              op: 'add',
              path: HCO_ROLE_AGGREGATION_STRATEGY_PATH,
              value: HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY,
            },
          ],
          resource: hyperConverge,
        }),
      );
    });

    it('REPLACEs with Manual when field exists', async () => {
      const hyperConverge = createHyperConverge(HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY);

      await setRoleAggregationStrategy(hyperConverge, false);

      expect(mockKubevirtK8sPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            {
              op: 'replace',
              path: HCO_ROLE_AGGREGATION_STRATEGY_PATH,
              value: HCO_MANUAL_ROLE_AGGREGATION_STRATEGY,
            },
          ],
        }),
      );
    });
  });
});
