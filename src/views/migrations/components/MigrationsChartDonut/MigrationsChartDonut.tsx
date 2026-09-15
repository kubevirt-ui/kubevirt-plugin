import React, { type FC } from 'react';

import { type V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import SubTitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/SubTitleChartLabel';
import TitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/TitleChartLabel';
import { type OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartDonut } from '@patternfly/react-charts/victory';
import { CardFooter, Split, SplitItem } from '@patternfly/react-core';

import LiveMigrationSettingsPopover from '../LiveMigrationSettingsPopover/LiveMigrationSettingsPopover';
import MigrationChartLegend from './MigrationChartLegend';
import { getMigrationChartData, getMigrationChartTotal } from './utils';

type MigrationsChartDonutProps = {
  onSetFilters: OnSetFilters;
  vmims: V1VirtualMachineInstanceMigration[];
};

const MigrationsChartDonut: FC<MigrationsChartDonutProps> = ({ onSetFilters, vmims }) => {
  const { t } = useKubevirtTranslation();

  if (!vmims?.length) return null;

  const chartData = getMigrationChartData(vmims);

  return (
    <>
      <ChartDonut
        ariaDesc={t('Cluster scope migrations')}
        ariaTitle={t('Migrations')}
        constrainToVisibleArea
        data={chartData}
        height={220}
        labels={({ datum }) => t('{{status}}: {{count}}', { count: datum.y, status: datum.x })}
        legendPosition="bottom"
        padding={20}
        style={{ data: { fill: ({ datum }) => datum.fill } }}
        subTitle={t('Migrations')}
        subTitleComponent={<SubTitleChartLabel />}
        title={getMigrationChartTotal(chartData).toString()}
        titleComponent={<TitleChartLabel />}
        width={600}
      />
      <CardFooter>
        <Split hasGutter>
          <SplitItem isFilled>
            <MigrationChartLegend legendItems={chartData} onSetFilters={onSetFilters} />
          </SplitItem>
          <SplitItem>
            <LiveMigrationSettingsPopover />
          </SplitItem>
        </Split>
      </CardFooter>
    </>
  );
};

export default MigrationsChartDonut;
