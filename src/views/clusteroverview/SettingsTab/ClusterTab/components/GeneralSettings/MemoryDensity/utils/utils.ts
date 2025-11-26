import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import {
  MEMORY_OVERCOMMIT_END_VALUE,
  MEMORY_OVERCOMMIT_STARTING_VALUE,
  MEMORY_OVERCOMMIT_STEP,
} from './const';

export const updateMemoryOvercommit = async (
  hyperConverge: HyperConverged,
  value: number,
): Promise<void> => {
  await k8sPatch({
    data: [
      {
        op: 'replace',
        path: `/spec/higherWorkloadDensity/memoryOvercommitPercentage`,
        value,
      },
    ],
    model: HyperConvergedModel,
    resource: hyperConverge,
  });
};

export const getCurrentOvercommit = (hyperConverge: HyperConverged): number =>
  hyperConverge?.spec?.higherWorkloadDensity?.memoryOvercommitPercentage ||
  MEMORY_OVERCOMMIT_STARTING_VALUE;

export const verifyMemoryOvercommitValue = (value: number): number => {
  if (value >= MEMORY_OVERCOMMIT_END_VALUE) return MEMORY_OVERCOMMIT_END_VALUE;
  if (value <= MEMORY_OVERCOMMIT_STARTING_VALUE) return MEMORY_OVERCOMMIT_STARTING_VALUE;
  return Math.round(value / MEMORY_OVERCOMMIT_STEP) * MEMORY_OVERCOMMIT_STEP;
};

export const generateSliderSteps = () =>
  Array.from(
    {
      length:
        (MEMORY_OVERCOMMIT_END_VALUE - MEMORY_OVERCOMMIT_STARTING_VALUE) / MEMORY_OVERCOMMIT_STEP +
        1,
    },
    (_, index) => {
      const value = MEMORY_OVERCOMMIT_STARTING_VALUE + index * MEMORY_OVERCOMMIT_STEP;
      const isLabelVisible = value % 100 === 0;
      return {
        isLabelHidden: !isLabelVisible,
        label: `${value}%`,
        value,
      };
    },
  );
