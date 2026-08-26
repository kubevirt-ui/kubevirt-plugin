import React, { type FC, useMemo } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  type SetTopConsumerData,
  type TopConsumersData,
} from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
import { SelectOption } from '@patternfly/react-core';

import { TopConsumerMetric } from './topConsumerMetric';
import { TopConsumersChartList } from './TopConsumersChartList';
import { TopConsumerScope } from './topConsumerScope';

import './TopConsumerCard.scss';

type CardSettings = {
  metric?: { value?: string };
  scope?: { value?: string };
};

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
  const activeNamespace = useActiveNamespace();
  const isAllNamespaces = activeNamespace === ALL_NAMESPACES_SESSION_KEY;

  const cardData = localStorageData?.[cardID] as CardSettings | undefined;

  const metricKey = useMemo(() => cardData?.metric?.value, [cardData]);

  const scopeKey = useMemo(() => cardData?.scope?.value, [cardData]);

  const currentScope = TopConsumerScope.fromString(scopeKey);
  const availableScopes = TopConsumerScope.getAll(isAllNamespaces);

  const defaultScope = useMemo(() => {
    return availableScopes.includes(currentScope) ? currentScope : TopConsumerScope.vm;
  }, [availableScopes, currentScope]);

  const onMetricSelect = (value: string): void => {
    setLocalStorageData(cardID, {
      ...cardData,
      metric: {
        ...cardData?.metric,
        value: TopConsumerMetric.fromDropdownLabel(value).toString(),
      },
    });
  };

  const onScopeSelect = (value: string): void => {
    setLocalStorageData(cardID, {
      ...cardData,
      scope: {
        ...cardData?.scope,
        value: TopConsumerScope.fromDropdownLabel(value).toString(),
      },
    });
  };

  return (
    <div className="co-overview-card--gradient kv-top-consumer-card__metric-card">
      <div className="kv-top-consumer-card__header">
        <div>
          <FormPFSelect
            onSelect={(_event, value): void => onMetricSelect(value as string)}
            selected={t(TopConsumerMetric.fromString(metricKey)?.getDropdownLabel())}
            toggleProps={{ id: 'kv-top-consumers-card-metric-select' }}
          >
            {TopConsumerMetric.getAll().map((metric) => (
              <SelectOption key={metric?.getValue()} value={metric?.getDropdownLabel()}>
                {t(metric?.getDropdownLabel())}
              </SelectOption>
            ))}
          </FormPFSelect>
        </div>
        <div className="kv-top-consumer-card__scope-select">
          <FormPFSelect
            onSelect={(_event, value): void => onScopeSelect(value as string)}
            selected={t(defaultScope?.getDropdownLabel())}
            toggleProps={{ id: 'kv-top-consumers-card-scope-select' }}
          >
            {availableScopes.map((scope) => (
              <SelectOption key={scope?.getValue()} value={scope?.getDropdownLabel()}>
                {t(scope?.getDropdownLabel())}
              </SelectOption>
            ))}
          </FormPFSelect>
        </div>
      </div>
      <div className="kv-top-consumer-card__chart-header">
        <div>{t('Resource')}</div>
        <div>{t('Usage')}</div>
      </div>
      <TopConsumersChartList
        localStorageData={localStorageData}
        metric={TopConsumerMetric.fromString(metricKey)}
        scope={defaultScope}
      />
    </div>
  );
};

export default TopConsumerCard;
