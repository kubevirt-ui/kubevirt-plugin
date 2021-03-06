import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import {
  Bullseye,
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

import MigrationsChartDonut from './components/MigrationsChartDonut/MigrationsChartDonut';
import MigrationsLimitionsPopover from './components/MigrationsLimitionsPopover/MigrationsLimitionsPopover';
import MigrationTable from './components/MigrationsTable/MigrationsTable';
import { getFilteredDurationVMIMS } from './components/MigrationsTable/utils/utils';
import useMigrationCardDataAndFilters from './hooks/useMigrationCardData';

import './MigrationsCard.scss';

const MigrationsCard: React.FC = () => {
  const { t } = useKubevirtTranslation();

  const [duration, setDuration] = useLocalStorage(
    MIGRATIONS_DURATION_KEY,
    DurationOption.FIVE_MIN.toString(),
  );

  const migrationCardDataAndFilters = useMigrationCardDataAndFilters(duration);

  const { vmims, onFilterChange } = migrationCardDataAndFilters || {};

  const filteredVMIMS = getFilteredDurationVMIMS(vmims, duration);

  const onDurationSelect = (value: string) =>
    setDuration(DurationOption.fromDropdownLabel(value)?.toString());

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
          {!isEmpty(filteredVMIMS) ? (
            <Grid>
              <GridItem span={6}>
                <Card className="kv-monitoring-card__card-right-border">
                  <CardHeader>
                    <CardTitle>{t('Migrations')}</CardTitle>
                    <CardActions className="co-overview-card__actions">
                      <MigrationsLimitionsPopover />
                    </CardActions>
                  </CardHeader>
                  <CardBody className="kv-monitoring-card__body">
                    <MigrationsChartDonut vmims={filteredVMIMS} onFilterChange={onFilterChange} />
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem span={6}>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('Bandwidth consumption')}</CardTitle>
                  </CardHeader>
                  <CardBody className="kv-monitoring-card__body">
                    {' '}
                    **** Chart placeholder ****
                  </CardBody>
                </Card>
              </GridItem>
              <GridItem span={12}>
                <Card>
                  <MigrationTable tableData={migrationCardDataAndFilters} />
                </Card>
              </GridItem>
            </Grid>
          ) : (
            <Bullseye>
              <div className="co-m-pane__body">{t('No migrations found')}</div>
            </Bullseye>
          )}
        </CardBody>
      </Card>
    </Overview>
  );
};

export default MigrationsCard;
