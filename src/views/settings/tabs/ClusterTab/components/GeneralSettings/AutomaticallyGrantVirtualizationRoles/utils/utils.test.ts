import {
  HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY,
  HCO_MANUAL_ROLE_AGGREGATION_STRATEGY,
} from '@kubevirt-utils/flags/consts';
import type { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { isAutomaticRoleGrantEnabled, setRoleAggregationStrategy } from './utils';

jest.mock('@multicluster/k8sRequests', () => ({
  kubevirtK8sPatch: jest.fn(),
}));

const mockKubevirtK8sPatch = kubevirtK8sPatch as jest.Mock;

const V1_ROLE_AGGREGATION_STRATEGY_PATH = '/spec/virtualization/roleAggregationStrategy';
const V1BETA1_ROLE_AGGREGATION_STRATEGY_PATH = '/spec/roleAggregationStrategy';

const createHyperConverge = (
  strategy?: string,
  apiVersion = 'hco.kubevirt.io/v1beta1',
): HyperConverged =>
  ({
    apiVersion,
    metadata: { name: 'kubevirt-hyperconverged', namespace: 'openshift-cnv' },
    spec: {
      ...(strategy ? { roleAggregationStrategy: strategy } : {}),
    },
  }) as HyperConverged;

const createHyperConvergeV1 = (strategy?: string): HyperConverged =>
  ({
    apiVersion: 'hco.kubevirt.io/v1',
    metadata: { name: 'kubevirt-hyperconverged', namespace: 'openshift-cnv' },
    spec: {
      ...(strategy ? { virtualization: { roleAggregationStrategy: strategy } } : {}),
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
    it('ADDs AggregateToDefault when field is missing on v1beta1', async () => {
      const hyperConverge = createHyperConverge();

      await setRoleAggregationStrategy(hyperConverge, true, 'cluster-a');

      expect(mockKubevirtK8sPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          cluster: 'cluster-a',
          data: [
            {
              op: 'add',
              path: V1BETA1_ROLE_AGGREGATION_STRATEGY_PATH,
              value: HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY,
            },
          ],
          resource: hyperConverge,
        }),
      );
    });

    it('REPLACEs with Manual when field exists on v1beta1', async () => {
      const hyperConverge = createHyperConverge(HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY);

      await setRoleAggregationStrategy(hyperConverge, false);

      expect(mockKubevirtK8sPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            {
              op: 'replace',
              path: V1BETA1_ROLE_AGGREGATION_STRATEGY_PATH,
              value: HCO_MANUAL_ROLE_AGGREGATION_STRATEGY,
            },
          ],
        }),
      );
    });

    it('ADDs AggregateToDefault when field is missing on v1', async () => {
      const hyperConverge = createHyperConvergeV1();

      await setRoleAggregationStrategy(hyperConverge, true, 'cluster-a');

      expect(mockKubevirtK8sPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          cluster: 'cluster-a',
          data: [
            {
              op: 'add',
              path: '/spec/virtualization',
              value: {},
            },
            {
              op: 'add',
              path: V1_ROLE_AGGREGATION_STRATEGY_PATH,
              value: HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY,
            },
          ],
          resource: hyperConverge,
        }),
      );
    });

    it('REPLACEs with Manual when field exists on v1', async () => {
      const hyperConverge = createHyperConvergeV1(
        HCO_AGGREGATE_TO_DEFAULT_ROLE_AGGREGATION_STRATEGY,
      );

      await setRoleAggregationStrategy(hyperConverge, false);

      expect(mockKubevirtK8sPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            {
              op: 'replace',
              path: V1_ROLE_AGGREGATION_STRATEGY_PATH,
              value: HCO_MANUAL_ROLE_AGGREGATION_STRATEGY,
            },
          ],
        }),
      );
    });
  });
});
