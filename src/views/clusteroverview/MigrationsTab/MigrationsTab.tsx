import React, { FCC, useState } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import {
  Bullseye,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Grid,
  GridItem,
} from '@patternfly/react-core';

import BandwidthConsumptionCharts from './components/BandwidthConsumptionCharts/BandwidthConsumptionCharts';
import MigrationEmptyState from './components/MigrationEmptyState/MigrationEmptyState';
import MigrationsChartDonut from './components/MigrationsChartDonut/MigrationsChartDonut';
import MigrationTable from './components/MigrationsTable/MigrationsTable';
import useMigrationCardDataAndFilters from './hooks/useMigrationCardData';

import './MigrationsTab.scss';

type MigrationsTabProps = {
  duration: string;
};

const MigrationsTab: FCC<MigrationsTabProps> = ({ duration }) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const migrationCardDataAndFilters = useMigrationCardDataAndFilters(duration);

  const { filteredVMIMS, loaded, loadErrors, onFilterChange } = migrationCardDataAndFilters;

  return (
    <Overview>
      <Card className="kv-monitoring-card" data-test="kv-monitoring-card" isExpanded={isExpanded}>
        <CardHeader
          className="kv-monitoring-card__header"
          onExpand={() => setIsExpanded((prev) => !prev)}
          toggleButtonProps={{ 'aria-label': t('Toggle compute migration overview') }}
        >
          <CardTitle className="kv-monitoring-card__title">
            {t('Compute migration overview')}
          </CardTitle>
        </CardHeader>
        <CardExpandableContent>
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
                  <CardHeader>
                    <CardTitle>{t('Migrations')}</CardTitle>
                  </CardHeader>
                  <CardBody className="kv-monitoring-card__body">
                    <MigrationsChartDonut onFilterChange={onFilterChange} vmims={filteredVMIMS} />
                  </CardBody>
                </GridItem>
                <GridItem className="kv-monitoring-card__resources" span={6}>
                  <CardHeader>
                    <CardTitle>{t('Resources')}</CardTitle>
                  </CardHeader>
                  <CardBody className="kv-monitoring-card__body">
                    <BandwidthConsumptionCharts duration={duration} />
                  </CardBody>
                </GridItem>
              </Grid>
            )}
            {loaded && !loadErrors && isEmpty(filteredVMIMS) && (
              <Bullseye>
                <MigrationEmptyState />
              </Bullseye>
            )}
          </CardBody>
        </CardExpandableContent>
        <CardBody className="kv-monitoring-card__body">
          {loaded && !loadErrors && !isEmpty(filteredVMIMS) && (
            <MigrationTable tableData={migrationCardDataAndFilters} />
          )}
        </CardBody>
      </Card>
    </Overview>
  );
};

export default MigrationsTab;
