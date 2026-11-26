import { type CSSProperties, type FC } from 'react';

import { type V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import SubTitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/SubTitleChartLabel';
import TitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/TitleChartLabel';
import { type OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartDonut } from '@patternfly/react-charts/victory';
import { Flex, FlexItem } from '@patternfly/react-core';

import LiveMigrationSettingsPopover from '../LiveMigrationSettingsPopover/LiveMigrationSettingsPopover';
import { MIGRATIONS_DONUT_SIZE_PX } from './constants';
import MigrationChartLegend from './MigrationChartLegend';
import { getMigrationChartData, getMigrationChartTotal } from './utils';

import './MigrationsChartDonut.scss';

type MigrationsChartDonutProps = {
  onSetFilters: OnSetFilters;
  vmims: V1VirtualMachineInstanceMigration[];
};

const MigrationsChartDonut: FC<MigrationsChartDonutProps> = ({ onSetFilters, vmims }) => {
  const { t } = useKubevirtTranslation();

  if (!vmims?.length) return null;

  const legendData = getMigrationChartData(vmims);
  const donutData = legendData.filter((item) => item.y > 0);
  const total = getMigrationChartTotal(legendData);

  const donutSizeStyle = {
    '--migrations-donut-size': `${MIGRATIONS_DONUT_SIZE_PX}px`,
  } as CSSProperties;

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      className="migrations-chart-donut"
      direction={{ default: 'column' }}
      gap={{ default: 'gapMd' }}
      justifyContent={{ default: 'justifyContentCenter' }}
      style={donutSizeStyle}
    >
      <Flex
        className="migrations-chart-donut__overview"
        direction={{ default: 'column' }}
        gap={{ default: 'gapMd' }}
      >
        <Flex
          alignItems={{ default: 'alignItemsFlexStart' }}
          className="migrations-chart-donut__chart-and-legend"
          gap={{ default: 'gapSm' }}
        >
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            className="migrations-chart-donut__chart-column"
            direction={{ default: 'column' }}
            gap={{ default: 'gapMd' }}
          >
            <FlexItem className="migrations-chart-donut__chart">
              <ChartDonut
                ariaDesc={t('Cluster scope migrations')}
                ariaTitle={t('Migrations')}
                constrainToVisibleArea
                data={donutData}
                height={MIGRATIONS_DONUT_SIZE_PX}
                labels={({ datum }) =>
                  t('{{status}}: {{count}}', { count: datum.y, status: datum.x })
                }
                padding={0}
                style={{ data: { fill: ({ datum }) => datum.fill } }}
                subTitle={t('Migrations')}
                subTitleComponent={<SubTitleChartLabel />}
                title={total.toString()}
                titleComponent={<TitleChartLabel />}
                width={MIGRATIONS_DONUT_SIZE_PX}
              />
            </FlexItem>
            <FlexItem className="migrations-chart-donut__settings">
              <LiveMigrationSettingsPopover />
            </FlexItem>
          </Flex>
          <FlexItem className="migrations-chart-donut__legend">
            <MigrationChartLegend legendItems={legendData} onSetFilters={onSetFilters} />
          </FlexItem>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default MigrationsChartDonut;
