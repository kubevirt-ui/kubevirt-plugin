import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { NumberOperator } from '@kubevirt-utils/components/NumberOperatorSelect/constants';

export const initialVCPU = {
  operator: NumberOperator.GreaterThan,
  value: NaN,
};

export const initialMemory = {
  operator: NumberOperator.GreaterThan,
  unit: CAPACITY_UNITS.GiB,
  value: NaN,
};
