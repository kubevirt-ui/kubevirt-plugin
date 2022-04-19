import * as React from 'react';
import { Link } from 'react-router-dom';
import { TFunction } from 'i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';

import FormPFSelect from './utils/FormPFSelect';
import { TopConsumerMetric } from './utils/topConsumerMetric';
import TopConsumersGridRow from './utils/TopConsumersGridRow';

import './TopConsumersCard.scss';

const initialMetrics = [
  TopConsumerMetric.CPU,
  TopConsumerMetric.MEMORY,
  TopConsumerMetric.MEMORY_SWAP_TRAFFIC,
  TopConsumerMetric.STORAGE_THROUGHPUT,
  TopConsumerMetric.STORAGE_IOPS,
  TopConsumerMetric.CPU,
];

const topAmountSelectOptions = (t: TFunction) => [
  {
    key: 'top-5',
    value: t('Show top 5'),
  },
  {
    key: 'top-10',
    value: t('Show top 10'),
  },
];

const TopConsumersCard: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const [numItemsToShow, setNumItemsToShow] = React.useState<string>('Show top 5');
  const numItemsOptionSelected = React.useMemo(
    () => (numItemsToShow === 'Show top 5' ? 5 : 10),
    [numItemsToShow],
  );

  const onTopAmountSelect = (value) => setNumItemsToShow(value);

  return (
    <div className="kv-top-consumers-card">
      <Card data-test="kv-top-consumers-card">
        <CardHeader className="kv-top-consumers-card__header">
          <CardTitle>{t('Top consumers')} </CardTitle>
          <CardActions className="co-overview-card__actions">
            <Link to="/monitoring/dashboards/grafana-dashboard-kubevirt-top-consumers?period=4h">
              {t('View virtualization dashboard')}
            </Link>
            <div className="kv-top-consumers-card__dropdown">
              <FormPFSelect
                toggleId="kv-top-consumers-card-amount-select"
                variant={SelectVariant.single}
                selections={numItemsToShow}
                onSelect={(e, value) => onTopAmountSelect(value)}
              >
                {topAmountSelectOptions(t).map((opt) => (
                  <SelectOption key={opt.key} value={opt.value} />
                ))}
              </FormPFSelect>
            </div>
          </CardActions>
        </CardHeader>
        <CardBody className="kv-top-consumers-card__body">
          <TopConsumersGridRow
            topGrid
            numItemsToShow={numItemsOptionSelected}
            initialMetrics={initialMetrics.slice(0, 3)}
          />
          <TopConsumersGridRow
            numItemsToShow={numItemsOptionSelected}
            initialMetrics={initialMetrics.slice(3)}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default TopConsumersCard;
