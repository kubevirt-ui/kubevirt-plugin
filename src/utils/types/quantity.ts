import { QuantityUnit } from '@kubevirt-utils/utils/unitConstants';

export type Quantity = {
  unit: QuantityUnit;
  value: number;
};
