import React, { FC, useMemo } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  SetTopConsumerData,
  TopConsumersData,
} from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
import { Card, SelectOption, SelectVariant } from '@patternfly/react-core';

import { TopConsumerMetric } from './topConsumerMetric';
import { TopConsumersChartList } from './TopConsumersChartList';
import { TopConsumerScope } from './topConsumerScope';

import './TopConsumerCard.scss';

type TopConsumersMetricCard = {
  cardID: string;
  localStorageData: TopConsumersData;
  setLocalStorageData: SetTopConsumerData;
};

const TopConsumerCard: FC<TopConsumersMetricCard> = ({
  cardID,
  localStorageData,
  setLocalStorageData,
}) => {
  const { t } = useKubevirtTranslation();

  const metricKey = useMemo(
    () => localStorageData?.[cardID]?.metric?.value,
    [cardID, localStorageData],
  );

  const scopeKey = useMemo(
    () => localStorageData?.[cardID]?.scope?.value,
    [cardID, localStorageData],
  );

  const onMetricSelect = (value) => {
    setLocalStorageData(cardID, {
      ...localStorageData?.[cardID],
      metric: {
        ...localStorageData?.[cardID]?.metric,
        value: TopConsumerMetric.fromDropdownLabel(value).toString(),
      },
    });
  };
  const onScopeSelect = (value) => {
    setLocalStorageData(cardID, {
      ...localStorageData?.[cardID],
      scope: {
        ...localStorageData?.[cardID]?.scope,
        value: TopConsumerScope.fromDropdownLabel(value).toString(),
      },
    });
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
        localStorageData={localStorageData}
      />
    </Card>
  );
};

export default TopConsumerCard;
