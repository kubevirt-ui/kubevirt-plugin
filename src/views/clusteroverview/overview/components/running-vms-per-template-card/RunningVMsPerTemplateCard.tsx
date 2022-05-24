import * as React from 'react';
import { ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ChartDonut } from '@patternfly/react-charts';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Spinner,
  TitleSizes,
} from '@patternfly/react-core';

import { useRunningVMsPerTemplatesHook } from './hooks/useRunningVMsPerTemplateResources';
import EmptyStateNoVMs from './utils/EmptyStateNoVMs';
import RunningVMsChartLegend from './utils/RunningVMsChartLegend';
import { getChartData, getLegendItems, getTemplateToVMCountMap } from './utils/utils';

import './RunningVMsPerTemplateCard.scss';

const RunningVMsPerTemplateCard = () => {
  const { t } = useKubevirtTranslation();
  const useRunningVMsPerTemplatesResources = useRunningVMsPerTemplatesHook();
  const { loaded, vms, templates } = useRunningVMsPerTemplatesResources();
  const templateToVMCountMap = React.useMemo(
    () => getTemplateToVMCountMap(loaded, vms, templates),
    [loaded, vms, templates],
  );

  const chartData = getChartData(templateToVMCountMap);
  const legendItems = getLegendItems(templateToVMCountMap);
  const numVMs = vms?.length;

  const RunningVMsChart = (
    <div>
      <ChartDonut
        ariaDesc={t('VMs per template')}
        ariaTitle={t('VMs per template donut chart')}
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
    body = (
      <EmptyState>
        <EmptyStateIcon variant="container" component={Spinner} />
        <EmptyStateBody>{t('Loading ...')}</EmptyStateBody>
      </EmptyState>
    );
  } else if (!numVMs) {
    body = (
      <EmptyStateNoVMs titleSize={TitleSizes.md} className="kv-running-vms-card__empty-state" />
    );
  } else {
    body = (
      <>
        {RunningVMsChart}
        <RunningVMsChartLegend legendItems={legendItems} />
      </>
    );
  }

  return (
    <Card className="kv-running-vms-card__gradient" data-test-id="kv-running-vms-per-template-card">
      <CardHeader>
        <CardTitle>{t('VMs per template')}</CardTitle>
      </CardHeader>
      <CardBody>{body}</CardBody>
    </Card>
  );
};

export default RunningVMsPerTemplateCard;
