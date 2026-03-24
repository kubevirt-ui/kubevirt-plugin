import React, { FC, useMemo } from 'react';

import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import { buildSpokeConsoleUrl } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
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

import MultiClusterMigrationStatusSection from './MultiClusterMigrationStatusSection';
import { buildMigrationsSpokePath, getMigrationsTabPath, MIGRATIONS_DURATION } from './utils';

const MigrationStatusSection: FC<OverviewSectionData> = ({ cluster, namespace, title }) => {
  const { t } = useKubevirtTranslation();
  const isAllClustersPage = useIsAllClustersPage();
  const isACMPage = useIsACMPage();
  const activeCluster = useActiveClusterParam();
  const activeNamespace = useActiveNamespace();
  const { isSpokeCluster, spokeConsoleURL } = useManagedClusterConsoleURLs(cluster);

  const overviewLevel = determineOverviewLevel(namespace, isAllClustersPage);
  const isClusterLevel = overviewLevel === OVERVIEW_LEVEL_CLUSTER;
  const isMultiClusterLevel = overviewLevel === OVERVIEW_LEVEL_MULTICLUSTER;

  const { filteredVMIMS, loaded: migrationsLoaded } =
    useMigrationCardDataAndFilters(MIGRATIONS_DURATION);

  const migrationsTabPath = useMemo(() => {
    if (isSpokeCluster) return undefined;
    return getMigrationsTabPath(isACMPage, activeCluster, activeNamespace);
  }, [isACMPage, activeCluster, activeNamespace, isSpokeCluster]);

  const migrationsTabHref = useMemo(() => {
    if (!isSpokeCluster) return undefined;
    return buildSpokeConsoleUrl(spokeConsoleURL, buildMigrationsSpokePath(activeNamespace));
  }, [isSpokeCluster, spokeConsoleURL, activeNamespace]);

  if (isMultiClusterLevel) {
    return <MultiClusterMigrationStatusSection title={title} />;
  }

  return (
    <OverviewSection dataTestId="migration-status-section" title={title}>
      <OverviewSectionRow gridColumns={isClusterLevel ? GRID_THREE_EQUAL : undefined}>
        <MigrationsWidget
          cardTitle={t('Compute migrations')}
          isLoading={!migrationsLoaded}
          migrationsTabHref={migrationsTabHref}
          migrationsTabPath={migrationsTabPath}
          subHeader={t('Last day')}
          vmims={filteredVMIMS}
        />
        {isClusterLevel && <StorageMigrationPlansWidget cluster={cluster} />}
      </OverviewSectionRow>
    </OverviewSection>
  );
};

export default MigrationStatusSection;
