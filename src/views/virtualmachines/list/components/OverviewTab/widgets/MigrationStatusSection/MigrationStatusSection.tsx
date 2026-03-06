import React, { FC } from 'react';

import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useMigrationCardDataAndFilters from '@overview/MigrationsTab/hooks/useMigrationCardData';

import { determineOverviewLevel } from '../../config';
import {
  GRID_THREE_EQUAL,
  OVERVIEW_LEVEL_CLUSTER,
  OVERVIEW_LEVEL_MULTICLUSTER,
  OverviewSectionData,
} from '../../types';
import MigrationsWidget from '../MigrationsWidget/MigrationsWidget';
import OverviewSection from '../OverviewSection/OverviewSection';
import OverviewSectionRow from '../OverviewSection/OverviewSectionRow';
import StorageMigrationPlansWidget from '../StorageMigrationPlansWidget/StorageMigrationPlansWidget';

const MIGRATIONS_DURATION = DurationOption.ONE_DAY.toString();

const MigrationStatusSection: FC<OverviewSectionData> = ({ cluster, namespace, title }) => {
  const isAllClustersPage = useIsAllClustersPage();
  const { filteredVMIMS, loaded: migrationsLoaded } =
    useMigrationCardDataAndFilters(MIGRATIONS_DURATION);

  const overviewLevel = determineOverviewLevel(namespace, isAllClustersPage);

  const isClusterLevel = overviewLevel === OVERVIEW_LEVEL_CLUSTER;
  const isMultiClusterLevel = overviewLevel === OVERVIEW_LEVEL_MULTICLUSTER;

  return (
    <OverviewSection dataTestId="migration-status-section" title={title}>
      <OverviewSectionRow gridColumns={isClusterLevel ? GRID_THREE_EQUAL : undefined}>
        <MigrationsWidget
          isAllClustersPage={isMultiClusterLevel}
          isLoading={!migrationsLoaded}
          vmims={filteredVMIMS}
        />
        {isClusterLevel && <StorageMigrationPlansWidget cluster={cluster} />}
      </OverviewSectionRow>
    </OverviewSection>
  );
};

export default MigrationStatusSection;
