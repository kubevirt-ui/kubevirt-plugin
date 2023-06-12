import * as React from 'react';
import { getColorList } from 'src/views/clusteroverview/OverviewTab/vms-per-resource-card/utils/utils';

import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDonut } from '@patternfly/react-charts';

import MigrationChartLegend from './MigrationChartLegend';

type MigrationsChartDonutProps = {
  onFilterChange: OnFilterChange;
  vmims: V1VirtualMachineInstanceMigration[];
};

export type ChartDataItem = {
  fill: any; // color to display in chart and legend
  x: string; // vmim status key
  y: number; // count of each status
};

const MigrationsChartDonut: React.FC<MigrationsChartDonutProps> = ({ onFilterChange, vmims }) => {
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
      fill: colorListIter.next().value,
      x: status,
      y: statusCount,
    }),
  );

  return (
    <>
      <ChartDonut
        style={{
          data: {
            fill: ({ datum }) => datum.fill,
          },
        }}
        ariaDesc={t('Cluster scope migrations')}
        ariaTitle={t('Migrations')}
        constrainToVisibleArea
        data={chartData}
        height={220}
        labels={({ datum }) => `${datum.x}: ${datum.y}`}
        legendPosition="bottom"
        padding={20}
        subTitle={t('Migrations')}
        title={vmims?.length.toString()}
        width={600}
      />
      <MigrationChartLegend legendItems={chartData} onFilterChange={onFilterChange} />
    </>
  );
};

export default MigrationsChartDonut;
