import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import DurationDropdown from '@kubevirt-utils/components/DurationOption/DurationDropdown';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTopConsumerCards from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTopConsumerCards';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardHeader, CardTitle, SelectOption } from '@patternfly/react-core';

import { TOP_CONSUMERS_DURATION_KEY, TOP_CONSUMERS_NUM_ITEMS_KEY } from './utils/constants';
import TopConsumersGridRow from './utils/TopConsumersGridRow';
import { TOP_AMOUNT_SELECT_OPTIONS } from './utils/utils';

import './TopConsumersTab.scss';

const TopConsumersTab: FC = () => {
  const { t } = useKubevirtTranslation();

  const [localStorageData, setLocalStorageData] = useKubevirtUserSettingsTopConsumerCards();
  const onNumItemsSelect = (value) => setLocalStorageData(TOP_CONSUMERS_NUM_ITEMS_KEY, value);
  const onDurationSelect = (value: string) =>
    setLocalStorageData(
      TOP_CONSUMERS_DURATION_KEY,
      DurationOption.fromDropdownLabel(value).toString(),
    );

  return (
    <Overview>
      <Card data-test="kv-top-consumers-card">
        <CardHeader
          actions={{
            actions: (
              <>
                <Link to="/monitoring/dashboards/grafana-dashboard-kubevirt-top-consumers?period=4h">
                  {t('View virtualization dashboard')}
                </Link>
                <div className="kv-top-consumers-card__dropdown--duration">
                  <DurationDropdown
                    selectedDuration={localStorageData?.[TOP_CONSUMERS_DURATION_KEY]}
                    selectHandler={onDurationSelect}
                  />
                </div>
                <div className="kv-top-consumers-card__dropdown--num-items">
                  <FormPFSelect
                    onSelect={(_e, value) => onNumItemsSelect(value)}
                    selected={localStorageData?.[TOP_CONSUMERS_NUM_ITEMS_KEY]}
                    toggleProps={{ id: 'kv-top-consumers-card-amount-select' }}
                  >
                    {TOP_AMOUNT_SELECT_OPTIONS.map((opt) => (
                      <SelectOption key={opt.key} value={opt.value}>
                        {opt.value}
                      </SelectOption>
                    ))}
                  </FormPFSelect>
                </div>
              </>
            ),
            className: 'co-overview-card__actions',
            hasNoOffset: false,
          }}
          className="kv-top-consumers-card__header"
        >
          <CardTitle>{t('Top consumers')} </CardTitle>
        </CardHeader>
        <CardBody className="kv-top-consumers-card__body">
          <TopConsumersGridRow
            localStorageData={localStorageData}
            rowNumber={1}
            setLocalStorageData={setLocalStorageData}
            topGrid
          />
          <TopConsumersGridRow
            localStorageData={localStorageData}
            rowNumber={2}
            setLocalStorageData={setLocalStorageData}
          />
        </CardBody>
      </Card>
    </Overview>
  );
};

export default TopConsumersTab;
