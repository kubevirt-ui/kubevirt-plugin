import * as React from 'react';

import DurationDropdown from '@kubevirt-utils/components/DurationOption/DurationDropdown';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
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

import BandwidthConsumptionCharts from './components/BandwidthConsumptionCharts/BandwidthConsumptionCharts';
import MigrationEmptyState from './components/MigrationEmptyState/MigrationEmptyState';
import MigrationsChartDonut from './components/MigrationsChartDonut/MigrationsChartDonut';
import MigrationsLimitionsPopover from './components/MigrationsLimitionsPopover/MigrationsLimitionsPopover';
import MigrationTable from './components/MigrationsTable/MigrationsTable';
import { getFilteredDurationVMIMS } from './components/MigrationsTable/utils/utils';
import useMigrationCardDataAndFilters from './hooks/useMigrationCardData';
import { MIGRATIONS_DURATION_KEY } from './utils/constants';

import './MigrationsTab.scss';

const MigrationsTab: React.FC = () => {
  const { t } = useKubevirtTranslation();

  const [duration, setDuration] = useLocalStorage(
    MIGRATIONS_DURATION_KEY,
    DurationOption.FIVE_MIN.toString(),
  );

  const migrationCardDataAndFilters = useMigrationCardDataAndFilters(duration);

  const { onFilterChange, vmims } = migrationCardDataAndFilters || {};

  const filteredVMIMS = getFilteredDurationVMIMS(vmims, duration);

  const onDurationSelect = (value: string) =>
    setDuration(DurationOption.fromDropdownLabel(value)?.toString());

  return (
    <Overview>
      <Card data-test="kv-monitoring-card">
        <CardHeader className="kv-monitoring-card__header">
          <CardTitle>{t('VirtualMachineInstanceMigrations information')} </CardTitle>
          <CardActions className="co-overview-card__actions">
            <div className="kv-top-consumers-card__dropdown--duration">
              <DurationDropdown selectedDuration={duration} selectHandler={onDurationSelect} />
            </div>
          </CardActions>
        </CardHeader>
        <CardBody className="kv-monitoring-card__body">
          {!isEmpty(filteredVMIMS) ? (
            <Grid>
              <GridItem className="kv-monitoring-card__graph-separator" span={6}>
                <CardHeader>
                  <CardTitle>{t('Migrations')}</CardTitle>
                  <CardActions className="co-overview-card__actions">
                    <MigrationsLimitionsPopover />
                  </CardActions>
                </CardHeader>
                <CardBody className="kv-monitoring-card__body">
                  <MigrationsChartDonut onFilterChange={onFilterChange} vmims={filteredVMIMS} />
                </CardBody>
              </GridItem>
              <GridItem span={6}>
                <CardHeader>
                  <CardTitle>{t('Bandwidth consumption')}</CardTitle>
                </CardHeader>
                <CardBody className="kv-monitoring-card__body">
                  <BandwidthConsumptionCharts duration={duration} />
                </CardBody>
              </GridItem>
              <GridItem className="kv-monitoring-card__table-separator" span={12}>
                <MigrationTable tableData={migrationCardDataAndFilters} />
              </GridItem>
            </Grid>
          ) : (
            <Bullseye>
              <MigrationEmptyState />
            </Bullseye>
          )}
        </CardBody>
      </Card>
    </Overview>
  );
};

export default MigrationsTab;
