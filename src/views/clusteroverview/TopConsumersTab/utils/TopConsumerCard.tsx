import React, { FC, useMemo } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  SetTopConsumerData,
  TopConsumersData,
} from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { SelectOption } from '@patternfly/react-core';

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
  const [activeNamespace] = useActiveNamespace();
  const isAllNamespaces = activeNamespace === ALL_NAMESPACES_SESSION_KEY;

  const metricKey = useMemo(
    () => localStorageData?.[cardID]?.metric?.value,
    [cardID, localStorageData],
  );

  const scopeKey = useMemo(
    () => localStorageData?.[cardID]?.scope?.value,
    [cardID, localStorageData],
  );

  const currentScope = TopConsumerScope.fromString(scopeKey);

  const availableScopes = useMemo(() => {
    if (isAllNamespaces) {
      return TopConsumerScope.getAll();
    }
    return [TopConsumerScope.VM, TopConsumerScope.NODE];
  }, [isAllNamespaces]);

  const defaultScope = useMemo(() => {
    return availableScopes.includes(currentScope) ? currentScope : TopConsumerScope.VM;
  }, [availableScopes, currentScope]);

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
    <div className="co-overview-card--gradient kv-top-consumer-card__metric-card">
      <div className="kv-top-consumer-card__header">
        <div>
          <FormPFSelect
            onSelect={(_e, value) => onMetricSelect(value)}
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
            onSelect={(_e, value) => onScopeSelect(value)}
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
