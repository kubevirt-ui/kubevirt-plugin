import type { FC } from 'react';

import { PlanModel } from '@forklift-ui/types';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
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
      <OverviewSectionRow className="overview-section__row--single-column-wide">
        {!isMTVInstalled && <MTVNotInstalledCard />}
        {isMTVInstalled && (
          <StateHandler
            error={loadError}
            hasData={!isEmpty(plans)}
            inlineAccessDenied
            loaded={mtvLoaded}
          >
            <CrossClusterMigrationPlansWidget
              isLoading={!mtvLoaded}
              plans={plans}
              plansListPath={MTV_PLANS_LIST_PATH}
            />
          </StateHandler>
        )}
      </OverviewSectionRow>
    </OverviewSection>
  );
};

export default MultiClusterMigrationStatusSection;
