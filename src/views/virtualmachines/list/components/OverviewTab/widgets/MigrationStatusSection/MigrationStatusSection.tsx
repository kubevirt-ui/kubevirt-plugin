import React, { FC, useMemo } from 'react';

import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useClusterVersion from '@kubevirt-utils/hooks/useClusterVersion/useClusterVersion';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import { buildSpokeConsoleUrl } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import useMigrationCardDataAndFilters from '@overview/MigrationsTab/hooks/useMigrationCardData';

import { determineOverviewLevel } from '../../config';
import {
  GRID_CLUSTER_MIGRATION_STATUS,
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

const MigrationStatusSection: FC<OverviewSectionData> = ({
  cluster,
  namespace,
  title,
  vmNames,
}) => {
  const { t } = useKubevirtTranslation();
  const isAllClustersPage = useIsAllClustersPage();
  const isACMPage = useIsACMPage();
  const activeCluster = useActiveClusterParam();
  const activeNamespace = useActiveNamespace();
  const { isSpokeCluster, spokeConsoleURL } = useManagedClusterConsoleURLs(cluster);
  const effectiveCluster = cluster ?? activeCluster ?? undefined;
  const [clusterVersion, clusterVersionLoaded] = useClusterVersion(effectiveCluster);

  const overviewLevel = determineOverviewLevel(namespace, isAllClustersPage);
  const isClusterLevel = overviewLevel === OVERVIEW_LEVEL_CLUSTER;
  const isMultiClusterLevel = overviewLevel === OVERVIEW_LEVEL_MULTICLUSTER;

  const { filteredVMIMS, loaded: migrationsLoaded } =
    useMigrationCardDataAndFilters(MIGRATIONS_DURATION);

  const folderFilteredVMIMS = useMemo(() => {
    if (!vmNames) return filteredVMIMS;
    const nameSet = new Set(vmNames);
    return filteredVMIMS.filter((vmim) => nameSet.has(vmim?.spec?.vmiName));
  }, [filteredVMIMS, vmNames]);

  const migrationsTabPath = useMemo(() => {
    if (isSpokeCluster) return undefined;
    return getMigrationsTabPath(
      isACMPage,
      activeCluster,
      activeNamespace,
      clusterVersion,
      clusterVersionLoaded,
    );
  }, [
    activeCluster,
    activeNamespace,
    clusterVersion,
    clusterVersionLoaded,
    isACMPage,
    isSpokeCluster,
  ]);

  const migrationsTabHref = useMemo(() => {
    if (!isSpokeCluster) return undefined;
    const spokePath = buildMigrationsSpokePath(
      activeNamespace,
      clusterVersion,
      clusterVersionLoaded,
    );
    if (!spokePath) return undefined;
    return buildSpokeConsoleUrl(spokeConsoleURL, spokePath);
  }, [activeNamespace, clusterVersion, clusterVersionLoaded, isSpokeCluster, spokeConsoleURL]);

  if (isMultiClusterLevel) {
    return <MultiClusterMigrationStatusSection title={title} />;
  }

  return (
    <OverviewSection dataTestId="migration-status-section" title={title}>
      <OverviewSectionRow
        className="overview-section__row--single-column-wide"
        gridColumns={GRID_CLUSTER_MIGRATION_STATUS}
      >
        <MigrationsWidget
          cardTitle={t('Compute migrations')}
          isLoading={!migrationsLoaded || !clusterVersionLoaded}
          migrationsTabHref={migrationsTabHref}
          migrationsTabPath={migrationsTabPath}
          subHeader={t('Last day')}
          vmims={folderFilteredVMIMS}
        />
        {isClusterLevel && <StorageMigrationPlansWidget cluster={cluster} />}
      </OverviewSectionRow>
    </OverviewSection>
  );
};

export default MigrationStatusSection;
