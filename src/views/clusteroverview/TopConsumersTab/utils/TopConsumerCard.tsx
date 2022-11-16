import * as React from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { Card, SelectOption, SelectVariant } from '@patternfly/react-core';

import { TopConsumerMetric } from './topConsumerMetric';
import { TopConsumersChartList } from './TopConsumersChartList';
import { TopConsumerScope } from './topConsumerScope';
import { initialTopConsumerCardSettings } from './utils';

import './TopConsumerCard.scss';

type TopConsumersMetricCard = {
  cardID: string;
};

const TopConsumerCard: React.FC<TopConsumersMetricCard> = ({ cardID }) => {
  const { t } = useKubevirtTranslation();

  const [metricKey, setMetricKey] = useLocalStorage(
    `${cardID}-metric-value`,
    initialTopConsumerCardSettings[cardID]?.metric.toString(),
  );
  const [scopeKey, setScopeKey] = useLocalStorage(
    `${cardID}-scope-value`,
    initialTopConsumerCardSettings[cardID]?.scope.toString(),
  );

  const onMetricSelect = (value) => {
    setMetricKey(TopConsumerMetric.fromDropdownLabel(value).toString());
  };
  const onScopeSelect = (value) => {
    setScopeKey(TopConsumerScope.fromDropdownLabel(value).toString());
  };

  return (
    <Card className="co-overview-card--gradient kv-top-consumer-card__metric-card">
      <div className="kv-top-consumer-card__header">
        <div>
          <FormPFSelect
            toggleId="kv-top-consumers-card-metric-select"
            variant={SelectVariant.single}
            selections={t(TopConsumerMetric.fromString(metricKey)?.getDropdownLabel())}
            onSelect={(e, value) => onMetricSelect(value)}
            isCheckboxSelectionBadgeHidden
          >
            {TopConsumerMetric.getAll().map((metric) => (
              <SelectOption key={metric?.getValue()} value={t(metric?.getDropdownLabel())} />
            ))}
          </FormPFSelect>
        </div>
        <div className="kv-top-consumer-card__scope-select">
          <FormPFSelect
            toggleId="kv-top-consumers-card-scope-select"
            variant={SelectVariant.single}
            selections={t(TopConsumerScope.fromString(scopeKey)?.getDropdownLabel())}
            onSelect={(e, value) => onScopeSelect(value)}
            isCheckboxSelectionBadgeHidden
          >
            {TopConsumerScope.getAll().map((scope) => (
              <SelectOption key={scope?.getValue()} value={t(scope?.getDropdownLabel())} />
            ))}
          </FormPFSelect>
        </div>
      </div>
      <div className="kv-top-consumer-card__chart-header">
        <div>{t('Resource')}</div>
        <div>{t('Usage')}</div>
      </div>
      <TopConsumersChartList
        metric={TopConsumerMetric.fromString(metricKey)}
        scope={TopConsumerScope.fromString(scopeKey)}
      />
    </Card>
  );
};

export default TopConsumerCard;
