import * as React from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';

import {
  SHOW_TOP_5_ITEMS,
  TOP_CONSUMERS_DURATION_KEY,
  TOP_CONSUMERS_NUM_ITEMS_KEY,
} from './utils/constants';
import DurationDropdown from './utils/DurationDropdown';
import DurationOption from './utils/DurationOption';
import FormPFSelect from './utils/FormPFSelect';
import TopConsumersGridRow from './utils/TopConsumersGridRow';
import { topAmountSelectOptions } from './utils/utils';

import './TopConsumersCard.scss';

const TopConsumersCard: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const [numItemsToShow, setNumItemsToShow] = useLocalStorage(
    TOP_CONSUMERS_NUM_ITEMS_KEY,
    SHOW_TOP_5_ITEMS,
  );
  const [duration, setDuration] = useLocalStorage(
    TOP_CONSUMERS_DURATION_KEY,
    DurationOption.FIVE_MIN.toString(),
  );

  const onNumItemsSelect = (value) => setNumItemsToShow(value);
  const onDurationSelect = (value: string) =>
    setDuration(DurationOption.fromDropdownLabel(value).toString());

  return (
    <div className="kv-top-consumers-card">
      <Card data-test="kv-top-consumers-card">
        <CardHeader className="kv-top-consumers-card__header">
          <CardTitle>{t('Top consumers')} </CardTitle>
          <CardActions className="co-overview-card__actions">
            <Link to="/monitoring/dashboards/grafana-dashboard-kubevirt-top-consumers?period=4h">
              {t('View virtualization dashboard')}
            </Link>
            <div className="kv-top-consumers-card__dropdown--duration">
              <DurationDropdown selectedDuration={duration} selectHandler={onDurationSelect} />
            </div>
            <div className="kv-top-consumers-card__dropdown--num-items">
              <FormPFSelect
                toggleId="kv-top-consumers-card-amount-select"
                variant={SelectVariant.single}
                selections={numItemsToShow}
                onSelect={(e, value) => onNumItemsSelect(value)}
              >
                {topAmountSelectOptions(t).map((opt) => (
                  <SelectOption key={opt.key} value={opt.value} />
                ))}
              </FormPFSelect>
            </div>
          </CardActions>
        </CardHeader>
        <CardBody className="kv-top-consumers-card__body">
          <TopConsumersGridRow rowNumber={1} topGrid />
          <TopConsumersGridRow rowNumber={2} />
        </CardBody>
      </Card>
    </div>
  );
};

export default TopConsumersCard;
