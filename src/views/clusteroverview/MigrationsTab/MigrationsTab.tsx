import React, { FC } from 'react';

import DurationDropdown from '@kubevirt-utils/components/DurationOption/DurationDropdown';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import {
  Bullseye,
  Card,
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
import useMigrationCardDataAndFilters from './hooks/useMigrationCardData';
import { MIGRATIONS_DURATION_KEY } from './utils/constants';

import './MigrationsTab.scss';

const MigrationsTab: FC = () => {
  const { t } = useKubevirtTranslation();

  const [duration, setDuration] = useLocalStorage(
    MIGRATIONS_DURATION_KEY,
    DurationOption.FIVE_MIN.toString(),
  );

  const migrationCardDataAndFilters = useMigrationCardDataAndFilters(duration);

  const { filteredVMIMS, loaded, loadErrors, onFilterChange } = migrationCardDataAndFilters || {};

  const onDurationSelect = (value: string) =>
    setDuration(DurationOption.fromDropdownLabel(value)?.toString());

  return (
    <Overview>
      <Card data-test="kv-monitoring-card">
        <CardHeader
          actions={{
            actions: (
              <>
                <div className="kv-top-consumers-card__dropdown--duration">
                  <DurationDropdown selectedDuration={duration} selectHandler={onDurationSelect} />
                </div>
              </>
            ),
            className: 'co-overview-card__actions',
            hasNoOffset: false,
          }}
          className="kv-monitoring-card__header"
        >
          <CardTitle>{t('VirtualMachineInstanceMigrations information')} </CardTitle>
        </CardHeader>
        <CardBody className="kv-monitoring-card__body">
          {loadErrors && <ErrorAlert error={loadErrors} />}
          {!loaded && !loadErrors && (
            <Bullseye>
              <LoadingEmptyState />
            </Bullseye>
          )}
          {loaded && !loadErrors && !isEmpty(filteredVMIMS) && (
            <Grid>
              <GridItem className="kv-monitoring-card__graph-separator" span={6}>
                <CardHeader
                  actions={{
                    actions: (
                      <>
                        <MigrationsLimitionsPopover />
                      </>
                    ),
                    className: 'co-overview-card__actions',
                    hasNoOffset: false,
                  }}
                >
                  <CardTitle>{t('Migrations')}</CardTitle>
                </CardHeader>
                <CardBody className="kv-monitoring-card__body">
                  <MigrationsChartDonut onFilterChange={onFilterChange} vmims={filteredVMIMS} />
                </CardBody>
              </GridItem>
              <GridItem span={6}>
                <CardBody className="kv-monitoring-card__body">
                  <BandwidthConsumptionCharts duration={duration} />
                </CardBody>
              </GridItem>
              <GridItem className="kv-monitoring-card__table-separator" span={12}>
                <MigrationTable tableData={migrationCardDataAndFilters} />
              </GridItem>
            </Grid>
          )}
          {loaded && !loadErrors && isEmpty(filteredVMIMS) && (
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
