import * as React from 'react';
import { getColorList } from 'src/views/clusteroverview/OverviewTab/running-vms-per-template-card/utils/utils';

import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartDonut } from '@patternfly/react-charts';

import MigrationChartLegend from './MigrationChartLegend';

type MigrationsChartDonutProps = {
  vmims: V1VirtualMachineInstanceMigration[];
};

export type ChartDataItem = {
  x: string; // vmim status key
  y: number; // count of each status
  fill: any; // color to display in chart and legend
};

const MigrationsChartDonut: React.FC<MigrationsChartDonutProps> = ({ vmims }) => {
  const { t } = useKubevirtTranslation();

  if (!vmims?.length) return null;

  const vmimsStatusCountMap = vmims?.reduce((acc, vmim) => {
    const vmimStatusKey = vmim?.status?.phase;

    acc[vmimStatusKey] = acc?.[vmimStatusKey] + 1 || 1;

    return acc;
  }, {} as { [status: string]: number });

  const colorListIter = getColorList(Object.keys(vmimsStatusCountMap)?.length).values();

  const chartData: ChartDataItem[] = Object.entries(vmimsStatusCountMap)?.map(
    ([status, statusCount]) => ({
      x: status,
      y: statusCount,
      fill: colorListIter.next().value,
    }),
  );

  return (
    <>
      <ChartDonut
        ariaDesc={t('Cluster scope migrations')}
        ariaTitle={t('Migrations')}
        data={chartData}
        height={220}
        labels={({ datum }) => `${datum.x}: ${datum.y}`}
        legendPosition="bottom"
        padding={20}
        constrainToVisibleArea
        subTitle={t('Migrations')}
        title={vmims?.length.toString()}
        width={600}
        style={{
          data: {
            fill: ({ datum }) => datum.fill,
          },
        }}
      />
      <MigrationChartLegend legendItems={chartData} />
    </>
  );
};

export default MigrationsChartDonut;
