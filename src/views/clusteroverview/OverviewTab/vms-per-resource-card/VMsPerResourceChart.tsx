import React, { FC, useMemo } from 'react';
import { ReactNode } from 'react';

import SubTitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/SubTitleChartLabel';
import TitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/TitleChartLabel';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartDonut } from '@patternfly/react-charts/victory';
import { CardBody } from '@patternfly/react-core';

import useVMsPerResource from './hooks/useVMsPerResource';
import {
  getChartData,
  getInstanceTypeSeriesLabel,
  getResourceLegendItems,
  getResourcesToVMCountMap,
  vmsPerResourceCount,
} from './utils/utils';
import EmptyStateNoVMs from './EmptyStateNoVMs';
import RunningVMsChartLegend from './RunningVMsChartLegend';

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
        ariaDesc={t('VirtualMachines per resource')}
        ariaTitle={t('VirtualMachines per resource')}
        data={chartData}
        height={150}
        labels={({ datum }) => `${getInstanceTypeSeriesLabel(datum.x)}: ${datum.y}%`}
        subTitle={t('VMs')}
        subTitleComponent={<SubTitleChartLabel />}
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
