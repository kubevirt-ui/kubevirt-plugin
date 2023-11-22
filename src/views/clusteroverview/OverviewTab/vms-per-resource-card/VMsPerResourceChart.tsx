import React, { FC, useMemo } from 'react';
import { ReactNode } from 'react';

import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartDonut } from '@patternfly/react-charts';
import { CardBody, TitleSizes } from '@patternfly/react-core';

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
  const numVMs = vms?.length;
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
          data: {
            fill: ({ datum }) => datum.fill,
          },
          labels: {
            fontSize: 5,
          },
        }}
        ariaDesc={t('VirtualMachines per resource')}
        ariaTitle={t('VirtualMachines per resource')}
        data={chartData}
        height={150}
        labels={({ datum }) => `${getInstanceTypeSeriesLabel(datum.x)}: ${datum.y}%`}
        legendPosition="bottom"
        subTitle={t('VMs')}
        title={vmsPerResourcesCount?.toString()}
        width={300}
      />
    </div>
  );

  let body: ReactNode = null;
  if (!loaded) {
    body = <LoadingEmptyState />;
  } else if (!numVMs) {
    body = <EmptyStateNoVMs titleSize={TitleSizes.md} />;
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
