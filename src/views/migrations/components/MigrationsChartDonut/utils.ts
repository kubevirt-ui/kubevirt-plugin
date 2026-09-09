import { type V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getMigrationPhase } from '@kubevirt-utils/resources/vmim/selectors';

import {
  defaultMigrationStatusColor,
  migrationChartStatusOrder,
  migrationStatusColorMap,
} from './constants';

export type ChartDataItem = {
  fill: string;
  x: string;
  y: number;
};

const statusOrderIndex = new Map(migrationChartStatusOrder.map((status, index) => [status, index]));

export const getMigrationStatusColor = (status: string): string =>
  migrationStatusColorMap[status] ?? defaultMigrationStatusColor;

export const getMigrationChartTotal = (chartData: ChartDataItem[]): number =>
  chartData.reduce((sum, item) => sum + item.y, 0);

const compareChartStatuses = (statusA: string, statusB: string): number => {
  const indexA = statusOrderIndex.get(statusA) ?? Number.MAX_SAFE_INTEGER;
  const indexB = statusOrderIndex.get(statusB) ?? Number.MAX_SAFE_INTEGER;

  if (indexA !== indexB) {
    return indexA - indexB;
  }

  return statusA.localeCompare(statusB);
};

export const getMigrationChartData = (
  vmims: V1VirtualMachineInstanceMigration[],
): ChartDataItem[] => {
  const statusCountMap = (vmims || []).reduce<{ [status: string]: number }>((acc, vmim) => {
    const status = getMigrationPhase(vmim);

    if (!status) {
      return acc;
    }

    acc[status] = (acc[status] ?? 0) + 1;

    return acc;
  }, {});

  return Object.entries(statusCountMap)
    .sort(([statusA], [statusB]) => compareChartStatuses(statusA, statusB))
    .map(([status, statusCount]) => ({
      fill: getMigrationStatusColor(status),
      x: status,
      y: statusCount,
    }));
};
