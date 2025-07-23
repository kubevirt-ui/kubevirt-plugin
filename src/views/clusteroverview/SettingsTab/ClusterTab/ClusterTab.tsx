import React, { FC } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import VirtualizationFeaturesSection from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/VirtualizationFeaturesSection';
import { Divider } from '@patternfly/react-core';

import { useKubevirtCSVDetails } from '../../utils/hooks/useKubevirtCSVDetails';
import { isNewBadgeNeeded } from '../../utils/utils';

import GeneralInformation from './components/GeneralInformation/GeneralInformation';
import GeneralSettings from './components/GeneralSettings/GeneralSettings';
import GuestManagementSection from './components/GuestManagmentSection/GuestManagementSection';
import PersistentReservationSection from './components/PersistentReservationSection/PersistentReservationSection';
import ResourceManagementSection from './components/ResourceManagementSection/ResourceManagementSection';

const ClusterTab: FC = () => {
  const hyperConvergeConfiguration = useHyperConvergeConfiguration();
  const error = hyperConvergeConfiguration?.[2];
  const { installedCSV, ...CSVDetails } = useKubevirtCSVDetails();
  const newBadge = isNewBadgeNeeded(installedCSV);
  return (
    <>
      <GeneralInformation {...CSVDetails} />
      <VirtualizationFeaturesSection />
      <Divider className="section-divider" />
      <GeneralSettings
        hyperConvergeConfiguration={hyperConvergeConfiguration}
        newBadge={newBadge}
      />
      <Divider className="section-divider" />
      <GuestManagementSection
        hyperConvergeConfiguration={hyperConvergeConfiguration}
        newBadge={newBadge}
      />
      <Divider className="section-divider" />
      <ResourceManagementSection
        hyperConvergeConfiguration={hyperConvergeConfiguration}
        newBadge={newBadge}
      />
      <Divider className="section-divider" />
      <PersistentReservationSection hyperConvergeConfiguration={hyperConvergeConfiguration} />
      <ErrorAlert error={error} />
    </>
  );
};

export default ClusterTab;
