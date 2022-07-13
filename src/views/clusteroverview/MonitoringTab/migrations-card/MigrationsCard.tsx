import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { useLocalStorage } from '@patternfly/quickstarts';
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Grid,
  GridItem,
} from '@patternfly/react-core';

import { MIGRATIONS_DURATION_KEY } from '../top-consumers-card/utils/constants';
import DurationDropdown from '../top-consumers-card/utils/DurationDropdown';
import DurationOption from '../top-consumers-card/utils/DurationOption';

import MigrationTable from './components/MigrationsTable/MigrationsTable';

import './MigrationsCard.scss';

const MigrationsCard: React.FC = () => {
  const { t } = useKubevirtTranslation();

  const [duration, setDuration] = useLocalStorage(
    MIGRATIONS_DURATION_KEY,
    DurationOption.FIVE_MIN.toString(),
  );

  const onDurationSelect = (value: string) =>
    setDuration(DurationOption.fromDropdownLabel(value).toString());

  return (
    <Overview>
      <Card data-test="kv-monitoring-card">
        <CardHeader className="kv-monitoring-card__header">
          <CardTitle>{t('VirtualMachine Migrations information')} </CardTitle>
          <CardActions className="co-overview-card__actions">
            <div className="kv-top-consumers-card__dropdown--duration">
              <DurationDropdown selectedDuration={duration} selectHandler={onDurationSelect} />
            </div>
          </CardActions>
        </CardHeader>
        <CardBody className="kv-monitoring-card__body">
          <Grid className="kv-monitoring-card__grid">
            <GridItem className="kv-monitoring-card__card-grid-item" span={6}>
              <Card>
                <CardHeader className="kv-monitoring-card__header">
                  <CardTitle>Migrations</CardTitle>
                </CardHeader>
              </Card>
            </GridItem>
            <GridItem className="kv-monitoring-card__card-grid-item" span={6}>
              <Card>
                <CardHeader className="kv-monitoring-card__header">
                  <CardTitle>Bandwidth consumption</CardTitle>
                </CardHeader>
              </Card>
            </GridItem>
            <GridItem span={12}>
              <Card>
                <CardBody>
                  <MigrationTable />
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    </Overview>
  );
};

export default MigrationsCard;
