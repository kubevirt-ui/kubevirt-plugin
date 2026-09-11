import type { FC } from 'react';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';

import SubTitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/SubTitleChartLabel';
import TitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/TitleChartLabel';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartDonut } from '@patternfly/react-charts/victory';
import { CardBody } from '@patternfly/react-core';

import EmptyStateNoVMs from './EmptyStateNoVMs';
import useVMsPerResource from './hooks/useVMsPerResource';
import RunningVMsChartLegend from './RunningVMsChartLegend';
import {
  getChartData,
  getInstanceTypeSeriesLabel,
  getResourceLegendItems,
  getResourcesToVMCountMap,
  vmsPerResourceCount,
} from './utils/utils';

import './VMsPerResourceCard.scss';
type VMsPerResourceChartProps = {
  type: string;
};
const VMsPerResourceChart: FC<VMsPerResourceChartProps> = ({ type }) => {
  const { t } = useKubevirtTranslation();
  const { loaded, vms } = useVMsPerResource();

  const resourceToVMCountMap = useMemo(
    () => getResourcesToVMCountMap(loaded, vms, type),
    [loaded, vms, type],
  );

  const chartData = getChartData(resourceToVMCountMap);
  const legendItems = getResourceLegendItems(resourceToVMCountMap);
  const vmsPerResourcesCount = vmsPerResourceCount(resourceToVMCountMap);

  const RunningVMsChart = (
    <div>
      <ChartDonut
        ariaDesc={t('VirtualMachines per resource')}
        ariaTitle={t('VirtualMachines per resource')}
        data={chartData}
        height={150}
        labels={({ datum }) => `${getInstanceTypeSeriesLabel(datum.x)}: ${datum.y}%`}
        padding={{
          bottom: 20,
          left: 20,
          right: 20,
          top: 20,
        }}
        style={{
          labels: {
            fontSize: 5,
          },
        }}
        subTitle={t('VMs')}
        subTitleComponent={<SubTitleChartLabel splitTitleText />}
        title={vmsPerResourcesCount?.toString()}
        titleComponent={<TitleChartLabel />}
        width={300}
      />
    </div>
  );

  let body: ReactNode = null;
  if (!loaded) {
    body = <LoadingEmptyState />;
  } else if (!vmsPerResourcesCount) {
    body = <EmptyStateNoVMs />;
  } else {
    body = (
      <>
        {RunningVMsChart}
        <RunningVMsChartLegend legendItems={legendItems} />
      </>
    );
  }

  return <CardBody>{body}</CardBody>;
};

export default VMsPerResourceChart;
