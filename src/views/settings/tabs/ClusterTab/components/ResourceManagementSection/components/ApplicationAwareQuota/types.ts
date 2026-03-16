import { CalculationMethod } from '@kubevirt-utils/resources/quotas/types';

export type CalculationMethodContent = {
  description: string;
  label: string;
  longLabel?: string;
  popover: string;
};

export type CalculationMethodContentMapper = Record<CalculationMethod, CalculationMethodContent>;
