import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { ChartData, ChartPoint } from './hooks/types';
import { METRICS } from './constants';

export const getCurrentValue = (chartData: ChartData) => chartData?.[chartData?.length - 1]?.y;

export const labelUnits: { [key: string]: string } = {
  [METRICS.VCPU_USAGE]: t('vCPU'),
  [METRICS.VM]: t('VMs'),
};

export const hasUnit = (metric: string): boolean =>
  metric === METRICS.MEMORY || metric === METRICS.STORAGE;

export const getLabelUnit = (metric, unit) => (hasUnit(metric) ? unit : labelUnits[metric]);

// Maps number of days of available data to which indexes to label
export const labeledTickIndexes: { [key: number]: number[] } = {
  1: [0],
  2: [0, 1],
  3: [0, 2],
  4: [1, 3],
  5: [0, 2, 4],
  6: [1, 3, 5],
  7: [0, 3, 6],
};

export const formatPopoverLabel =
  (displayUnit: string) =>
  ({ datum }: { datum: ChartPoint }) => {
    return `${timestampFor(
      datum?.x as Date,
      new Date(),
      false,
    )}\n ${datum?.y?.toLocaleString()} ${displayUnit}`;
  };
