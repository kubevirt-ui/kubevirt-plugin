import React, { FC } from 'react';

import { PlanModel } from '@kubev2v/types';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { MTV_MIGRATION_NAMESPACE } from '@multicluster/components/CrossClusterMigration/constants';

import CrossClusterMigrationPlansWidget from '../MigrationsWidget/components/CrossClusterMigrationPlansWidget';
import MTVNotInstalledCard from '../MigrationsWidget/components/MTVNotInstalledCard';
import useMTVPlans from '../MigrationsWidget/hooks/useMTVPlans';
import OverviewSection from '../OverviewSection/OverviewSection';
import OverviewSectionRow from '../OverviewSection/OverviewSectionRow';

const MTV_PLANS_LIST_PATH = getResourceUrl({
  activeNamespace: MTV_MIGRATION_NAMESPACE,
  model: PlanModel,
});

type MultiClusterMigrationStatusSectionProps = {
  title: string;
};

const MultiClusterMigrationStatusSection: FC<MultiClusterMigrationStatusSectionProps> = ({
  title,
}) => {
  const { isMTVInstalled, loaded: mtvLoaded, loadError, plans } = useMTVPlans();

  return (
    <OverviewSection dataTestId="migration-status-section" title={title}>
      <OverviewSectionRow>
        {!isMTVInstalled && <MTVNotInstalledCard />}
        {isMTVInstalled && loadError && <ErrorAlert error={loadError} />}
        {isMTVInstalled && !loadError && (
          <CrossClusterMigrationPlansWidget
            isLoading={!mtvLoaded}
            plans={plans}
            plansListPath={MTV_PLANS_LIST_PATH}
          />
        )}
      </OverviewSectionRow>
    </OverviewSection>
  );
};

export default MultiClusterMigrationStatusSection;
