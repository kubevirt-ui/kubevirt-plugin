import React, { useMemo } from 'react';
import { ReactNode } from 'react';

import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartDonut } from '@patternfly/react-charts';
import { Card, CardBody, CardHeader, CardTitle, TitleSizes } from '@patternfly/react-core';

import useVMsPerTemplateResources from './hooks/useVMsPerTemplateResources';
import EmptyStateNoVMs from './utils/EmptyStateNoVMs';
import RunningVMsChartLegend from './utils/RunningVMsChartLegend';
import { getChartData, getLegendItems, getTemplateToVMCountMap } from './utils/utils';

import './VMsPerTemplateCard.scss';

const VMsPerTemplateCard = () => {
  const { t } = useKubevirtTranslation();
  const { loaded, vms, templates } = useVMsPerTemplateResources();

  const templateToVMCountMap = useMemo(
    () => getTemplateToVMCountMap(loaded, vms, templates),
    [loaded, vms, templates],
  );

  const chartData = getChartData(templateToVMCountMap);
  const legendItems = getLegendItems(templateToVMCountMap);
  const numVMs = vms?.length;

  const RunningVMsChart = (
    <div>
      <ChartDonut
        ariaDesc={t('VirtualMachines per template')}
        ariaTitle={t('VirtualMachines per template donut chart')}
        data={chartData}
        height={150}
        labels={({ datum }) => `${datum.x}: ${datum.y}%`}
        legendPosition="bottom"
        padding={{
          bottom: 20,
          left: 20,
          right: 20,
          top: 20,
        }}
        subTitle={t('VMs')}
        title={numVMs?.toString()}
        width={300}
        style={{
          data: {
            fill: ({ datum }) => datum.fill,
          },
        }}
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

  return (
    <Card className="vms-per-template-card__gradient" data-test-id="vms-per-template-card">
      <CardHeader>
        <CardTitle>{t('VirtualMachines per template')}</CardTitle>
      </CardHeader>
      <CardBody>{body}</CardBody>
    </Card>
  );
};

export default VMsPerTemplateCard;
