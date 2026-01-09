import React, { FC, useMemo } from 'react';
import { Helmet } from 'react-helmet';

import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
import HorizontalNavbar from '@kubevirt-utils/components/HorizontalNavbar/HorizontalNavbar';
import { NavPageKubevirt } from '@kubevirt-utils/components/HorizontalNavbar/utils/utils';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import {
  getMCONotInstalledTooltip,
  useClusterObservabilityDisabled,
} from '@kubevirt-utils/hooks/useAlerts/utils/useClusterObservabilityDisabled';
import { useForceProjectSelection } from '@kubevirt-utils/hooks/useForceProjectSelection';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useSignals } from '@preact/signals-react/runtime';
import { VIRTUALIZATION_PATHS } from '@virtualmachines/tree/utils/constants';

import GuidedTour from '../../utils/components/GuidedTour/GuidedTour';
import usePreserveTabDisplay from '../../utils/hooks/usePreserveTabDisplay';
import WelcomeModal from '../welcome/WelcomeModal';

import ClusterOverviewPageHeader from './Header/ClusterOverviewPageHeader';
import ObservabilityDisabledAlert from './Header/ObservabilityDisabledAlert';
import MigrationsTab from './MigrationsTab/MigrationsTab';
import OverviewTab from './OverviewTab/OverviewTab';
import SettingsTab from './SettingsTab/SettingsTab';
import TopConsumersTab from './TopConsumersTab/TopConsumersTab';

import './ClusterOverviewPage.scss';

const ClusterOverviewPage: FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const isACMPage = useIsACMPage();
  const cluster = useActiveClusterParam();
  const {
    disabledClusters,
    error: observabilityError,
    loaded: observabilityLoaded,
    mcoInstalled,
  } = useClusterObservabilityDisabled(true);
  useSignals();

  // When MCO is not installed, also disable "All clusters" option
  const disabledClustersWithAllClusters = useMemo(() => {
    if (!observabilityLoaded || observabilityError) {
      return undefined;
    }

    if (!mcoInstalled) {
      // Include ALL_CLUSTERS_KEY to disable "All clusters" option when MCO is not installed
      return [ALL_CLUSTERS_KEY, ...disabledClusters];
    }

    return disabledClusters;
  }, [observabilityLoaded, observabilityError, mcoInstalled, disabledClusters]);

  useForceProjectSelection([VIRTUALIZATION_PATHS.OVERVIEW]);
  usePreserveTabDisplay({
    basePath: VIRTUALIZATION_PATHS.OVERVIEW,
    storageKey: 'lastVirtualizationOverviewTab',
  });

  const isLoadingMCOCheck = isACMPage && !observabilityLoaded;

  const overviewTabs: NavPageKubevirt[] = useMemo(() => {
    const adminPages: NavPageKubevirt[] = [
      {
        component: TopConsumersTab,
        href: 'top-consumers',
        name: t('Top consumers'),
      },
    ];

    const settingsPages: NavPageKubevirt[] = [
      {
        component: SettingsTab,
        href: 'settings',
        name: t('Settings'),
      },
      {
        component: SettingsTab,
        href: 'settings/cluster',
        isHidden: true,
        name: 'settings/cluster',
      },
      {
        component: SettingsTab,
        href: 'settings/user',
        isHidden: true,
        name: 'settings/user',
      },
      {
        component: SettingsTab,
        href: 'settings/features',
        isHidden: true,
        name: 'settings/features',
      },
      {
        component: SettingsTab,
        href: 'settings/*',
        isHidden: true,
        name: 'settings/*',
      },
    ];
    return [
      {
        component: OverviewTab,
        href: '',
        name: t('Overview'),
      },
      ...(isAdmin ? [...adminPages] : []),
      {
        component: MigrationsTab,
        href: 'migrations',
        name: t('Migrations'),
      },
      ...(!isACMPage ? [...settingsPages] : []),
    ];
  }, [isAdmin, t, isACMPage]);

  if (isLoadingMCOCheck) {
    return (
      <>
        <Helmet>
          <title>{t('Virtualization')}</title>
        </Helmet>
        <LoadingEmptyState />
      </>
    );
  }

  return (
    <>
      {isACMPage && (
        <ClusterProjectDropdown
          disabledItemTooltip={
            !mcoInstalled
              ? getMCONotInstalledTooltip(t)
              : t('Observability is disabled for this cluster')
          }
          disabledClusters={disabledClustersWithAllClusters}
          includeAllClusters={true}
          includeAllProjects={true}
          onlyCNVClusters={true}
        />
      )}
      <Helmet>
        <title>{t('Virtualization')}</title>
      </Helmet>
      <WelcomeModal />
      <div className="cluster-overview-page">
        <div className="cluster-overview-page__header">
          <ClusterOverviewPageHeader />
          {isACMPage &&
            cluster === ALL_CLUSTERS_KEY &&
            observabilityLoaded &&
            !observabilityError &&
            disabledClusters.length > 0 && (
              <ObservabilityDisabledAlert disabledClusters={disabledClusters} />
            )}
        </div>
        <div className="cluster-overview-page__content">
          <HorizontalNavbar
            loaded={true}
            pages={overviewTabs}
            routesClassName="cluster-overview-page__routes"
          />
        </div>
      </div>
      <GuidedTour />
    </>
  );
};

export default ClusterOverviewPage;
