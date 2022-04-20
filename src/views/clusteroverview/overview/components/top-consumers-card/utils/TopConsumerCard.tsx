import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, SelectOption, SelectVariant } from '@patternfly/react-core';

import FormPFSelect from './FormPFSelect';
import { TopConsumerMetric } from './topConsumerMetric';
import { TopConsumersChartList } from './TopConsumersChartList';
import { TopConsumerScope } from './topConsumerScope';

import './TopConsumerCard.scss';

type TopConsumersMetricCard = {
  numItemsToShow: number;
  initialMetric?: TopConsumerMetric;
};

const TopConsumerCard: React.FC<TopConsumersMetricCard> = ({ numItemsToShow, initialMetric }) => {
  const { t } = useKubevirtTranslation();
  const [metricValue, setMetricValue] = React.useState<TopConsumerMetric>(
    initialMetric || TopConsumerMetric.CPU,
  );
  const [scopeValue, setScopeValue] = React.useState<TopConsumerScope>(TopConsumerScope.VM);

  const onMetricSelect = (value) => setMetricValue(TopConsumerMetric.fromDropdownLabel(value));
  const onScopeSelect = (value) => setScopeValue(TopConsumerScope.fromDropdownLabel(value));

  return (
    <Card className="co-overview-card--gradient kv-top-consumer-card__metric-card">
      <div className="kv-top-consumer-card__header">
        <div>
          <FormPFSelect
            toggleId="kv-top-consumers-card-metric-select"
            variant={SelectVariant.single}
            selections={t(metricValue.getDropdownLabel())}
            onSelect={(e, value) => onMetricSelect(value)}
            isCheckboxSelectionBadgeHidden
          >
            {TopConsumerMetric.getAll().map((metric) => (
              <SelectOption key={metric.getValue()} value={t(metric.getDropdownLabel())} />
            ))}
          </FormPFSelect>
        </div>
        <div className="kv-top-consumer-card__scope-select">
          <FormPFSelect
            toggleId="kv-top-consumers-card-scope-select"
            variant={SelectVariant.single}
            selections={t(scopeValue.getDropdownLabel())}
            onSelect={(e, value) => onScopeSelect(value)}
            isCheckboxSelectionBadgeHidden
          >
            {TopConsumerScope.getAll().map((scope) => (
              <SelectOption key={scope.getValue()} value={t(scope.getDropdownLabel())} />
            ))}
          </FormPFSelect>
        </div>
      </div>
      <div className="kv-top-consumer-card__chart-header">
        <div>{t('Resource')}</div>
        <div>{t('Usage')}</div>
      </div>
      <TopConsumersChartList numItems={numItemsToShow} metric={metricValue} scope={scopeValue} />
    </Card>
  );
};

export default TopConsumerCard;
