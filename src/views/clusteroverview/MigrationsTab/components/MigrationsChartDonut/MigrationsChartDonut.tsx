import React, { FC } from 'react';

import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';

import MigrationChartLegend from './MigrationChartLegend';

type MigrationsChartDonutProps = {
  onFilterChange: OnFilterChange;
  vmims: V1VirtualMachineInstanceMigration[];
};

export type ChartDataItem = {
  x: string; // vmim status key
  y: number; // count of each status
};

const MigrationsChartDonut: FC<MigrationsChartDonutProps> = ({ onFilterChange, vmims }) => {
  const { t } = useKubevirtTranslation();

  if (!vmims?.length) return null;

  const vmimsStatusCountMap = vmims?.reduce((acc, vmim) => {
    const vmimStatusKey = vmim?.status?.phase;

    acc[vmimStatusKey] = acc?.[vmimStatusKey] + 1 || 1;

    return acc;
  }, {} as { [status: string]: number });

  const chartData: ChartDataItem[] = Object.entries(vmimsStatusCountMap)?.map(
    ([status, statusCount]) => ({
      x: status,
      y: statusCount,
    }),
  );

  return (
    <>
      <ChartDonut
        ariaDesc={t('Cluster scope migrations')}
        ariaTitle={t('Migrations')}
        constrainToVisibleArea
        data={chartData}
        height={220}
        labels={({ datum }) => `${datum.x}: ${datum.y}`}
        legendPosition="bottom"
        padding={20}
        subTitle={t('Migrations')}
        themeColor={ChartThemeColor.multiOrdered}
        title={vmims?.length.toString()}
        width={600}
      />
      <MigrationChartLegend legendItems={chartData} onFilterChange={onFilterChange} />
    </>
  );
};

export default MigrationsChartDonut;
