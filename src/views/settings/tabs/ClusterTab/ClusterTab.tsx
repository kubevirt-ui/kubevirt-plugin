import React, { FC } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtCSVDetails } from '@overview/utils/hooks/useKubevirtCSVDetails';
import { isNewBadgeNeeded } from '@overview/utils/utils';
import { Card, Divider } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import GeneralInformation from './components/GeneralInformation/GeneralInformation';
import GeneralSettings from './components/GeneralSettings/GeneralSettings';
import GuestManagementSection from './components/GuestManagmentSection/GuestManagementSection';
import PersistentReservationSection from './components/PersistentReservationSection/PersistentReservationSection';
import ResourceManagementSection from './components/ResourceManagementSection/ResourceManagementSection';
import VirtualizationFeaturesList from './components/VirtualizationFeaturesSection/VirtualizationFeaturesList/VirtualizationFeaturesList';

const ClusterTab: FC = () => {
  const cluster = useSettingsCluster();
  const hyperConvergeConfiguration = useHyperConvergeConfiguration(cluster);
  const error = hyperConvergeConfiguration?.[2];
  const { installedCSV, ...CSVDetails } = useKubevirtCSVDetails(cluster);
  const newBadge = isNewBadgeNeeded(installedCSV);
  return (
    <>
      <Card variant="secondary">
        <GeneralInformation {...CSVDetails} />
      </Card>
      <Divider className="settings-tab__section-divider" />
      <VirtualizationFeaturesList />
      <Divider className="settings-tab__section-divider" />
      <GeneralSettings
        hyperConvergeConfiguration={hyperConvergeConfiguration}
        newBadge={newBadge}
      />
      <Divider className="settings-tab__section-divider" />
      <GuestManagementSection
        hyperConvergeConfiguration={hyperConvergeConfiguration}
        newBadge={newBadge}
      />
      <Divider className="settings-tab__section-divider" />
      <ResourceManagementSection
        hyperConvergeConfiguration={hyperConvergeConfiguration}
        newBadge={newBadge}
      />
      <Divider className="settings-tab__section-divider" />
      <PersistentReservationSection hyperConvergeConfiguration={hyperConvergeConfiguration} />
      <ErrorAlert error={error} />
    </>
  );
};

export default ClusterTab;
